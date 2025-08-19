import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { Device, DeviceStatus, DeviceType } from './entities/device.entity';
import { DeviceParameter } from './entities/device-parameter.entity';
import { DeviceProfile } from './entities/device-profile.entity';
import { ProvisioningJob, JobStatus, JobType } from './entities/provisioning-job.entity';
import { FirmwareUpgrade, UpgradeStatus } from './entities/firmware-upgrade.entity';

import { DeviceProvisioningService } from './services/device-provisioning.service';
import { DeviceMonitoringService } from './services/device-monitoring.service';

@Injectable()
export class Tr069Service {
  private readonly logger = new Logger(Tr069Service.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    
    @InjectRepository(DeviceParameter)
    private readonly parameterRepo: Repository<DeviceParameter>,
    
    @InjectRepository(DeviceProfile)
    private readonly profileRepo: Repository<DeviceProfile>,
    
    @InjectRepository(ProvisioningJob)
    private readonly jobRepo: Repository<ProvisioningJob>,
    
    @InjectRepository(FirmwareUpgrade)
    private readonly upgradeRepo: Repository<FirmwareUpgrade>,
    
    private readonly provisioningService: DeviceProvisioningService,
    private readonly monitoringService: DeviceMonitoringService,
  ) {}

  // ==================== Device Management ====================

  async getAllDevices(ispId: string, filters: {
    status?: DeviceStatus;
    type?: DeviceType;
    isOnline?: boolean;
    isProvisioned?: boolean;
    search?: string;
    userRole?: string;
  } = {}): Promise<Device[]> {
    // Skip ispId filtering for SUPER_ADMIN role
    const where: FindOptionsWhere<Device> = filters.userRole === 'SUPER_ADMIN' ? {} : { ispId };
    
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.isOnline !== undefined) where.isOnline = filters.isOnline;
    if (filters.isProvisioned !== undefined) where.isProvisioned = filters.isProvisioned;
    
    if (filters.search) {
      const queryBuilder = this.deviceRepo.createQueryBuilder('device');
      
      // Skip ispId filtering for SUPER_ADMIN role
      if (filters.userRole !== 'SUPER_ADMIN') {
        queryBuilder.where('device.ispId = :ispId', { ispId });
      }
      
      queryBuilder.andWhere('(device.name ILIKE :search OR device.serialNumber ILIKE :search OR device.macAddress ILIKE :search OR device.ipAddress ILIKE :search)', 
        { search: `%${filters.search}%` });
      
      return queryBuilder.getMany();
    }
    
    return this.deviceRepo.find({ 
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async getDeviceById(id: string, ispId: string): Promise<Device> {
    const device = await this.deviceRepo.findOne({ 
      where: { id, ispId },
      relations: ['profile'],
    });
    
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    
    return device;
  }

  async getDeviceBySerialNumber(serialNumber: string, ispId: string): Promise<Device> {
    const device = await this.deviceRepo.findOne({ 
      where: { serialNumber, ispId },
      relations: ['profile'],
    });
    
    if (!device) {
      throw new NotFoundException(`Device with serial number ${serialNumber} not found`);
    }
    
    return device;
  }

  async createDevice(data: {
    name: string;
    serialNumber: string;
    macAddress?: string;
    type?: DeviceType;
    manufacturer?: string;
    model?: string;
    description?: string;
    profileId?: string;
    ispId: string;
    clientId?: string;
    locationId?: string;
  }): Promise<Device> {
    // Check if device with same serial number already exists
    const existing = await this.deviceRepo.findOne({ 
      where: { serialNumber: data.serialNumber, ispId: data.ispId } 
    });
    
    if (existing) {
      throw new BadRequestException(`Device with serial number ${data.serialNumber} already exists`);
    }
    
    // If profile ID is provided, verify it exists
    if (data.profileId) {
      const profile = await this.profileRepo.findOne({ 
        where: { id: data.profileId, ispId: data.ispId } 
      });
      
      if (!profile) {
        throw new NotFoundException(`Profile with ID ${data.profileId} not found`);
      }
    }
    
    const device = this.deviceRepo.create({
      ...data,
      status: DeviceStatus.INACTIVE,
      isOnline: false,
      isProvisioned: false,
    });
    
    const savedDevice = await this.deviceRepo.save(device);
    this.logger.log(`Device ${savedDevice.name} (${savedDevice.serialNumber}) created`);
    
    return savedDevice;
  }

  async updateDevice(id: string, ispId: string, data: Partial<Device>): Promise<Device> {
    const device = await this.getDeviceById(id, ispId);
    
    // If changing profile, verify the new profile exists
    if (data.profileId && data.profileId !== device.profileId) {
      const profile = await this.profileRepo.findOne({ 
        where: { id: data.profileId, ispId } 
      });
      
      if (!profile) {
        throw new NotFoundException(`Profile with ID ${data.profileId} not found`);
      }
    }
    
    // Update device
    Object.assign(device, data);
    const updated = await this.deviceRepo.save(device);
    
    this.logger.log(`Device ${updated.name} (${updated.serialNumber}) updated`);
    return updated;
  }

  async deleteDevice(id: string, ispId: string): Promise<void> {
    const device = await this.getDeviceById(id, ispId);
    await this.deviceRepo.remove(device);
    this.logger.log(`Device ${device.name} (${device.serialNumber}) deleted`);
  }

  // ==================== Device Provisioning ====================

  async provisionDevice(id: string, ispId: string, options: {
    parameters?: Record<string, any>;
    notes?: string;
    createdById?: string;
  } = {}): Promise<ProvisioningJob> {
    const device = await this.getDeviceById(id, ispId);
    
    // Create provisioning job
    const job = this.jobRepo.create({
      deviceId: device.id,
      type: device.isProvisioned ? JobType.RECONFIGURE : JobType.INITIAL_PROVISION,
      status: JobStatus.PENDING,
      parameters: options.parameters,
      notes: options.notes,
      createdById: options.createdById,
    });
    
    const savedJob = await this.jobRepo.save(job);
    
    // Update device status
    device.status = DeviceStatus.PROVISIONING;
    await this.deviceRepo.save(device);
    
    // Queue the provisioning job for processing
    await this.provisioningService.queueProvisioningJob(savedJob.id);
    
    this.logger.log(`Provisioning job ${savedJob.id} created for device ${device.name}`);
    return savedJob;
  }

  async rebootDevice(id: string, ispId: string, options: {
    notes?: string;
    createdById?: string;
  } = {}): Promise<ProvisioningJob> {
    const device = await this.getDeviceById(id, ispId);
    
    // Create reboot job
    const job = this.jobRepo.create({
      deviceId: device.id,
      type: JobType.REBOOT,
      status: JobStatus.PENDING,
      notes: options.notes,
      createdById: options.createdById,
    });
    
    const savedJob = await this.jobRepo.save(job);
    
    // Queue the reboot job for processing
    await this.provisioningService.queueProvisioningJob(savedJob.id);
    
    this.logger.log(`Reboot job ${savedJob.id} created for device ${device.name}`);
    return savedJob;
  }

  async factoryResetDevice(id: string, ispId: string, options: {
    notes?: string;
    createdById?: string;
  } = {}): Promise<ProvisioningJob> {
    const device = await this.getDeviceById(id, ispId);
    
    // Create factory reset job
    const job = this.jobRepo.create({
      deviceId: device.id,
      type: JobType.FACTORY_RESET,
      status: JobStatus.PENDING,
      notes: options.notes,
      createdById: options.createdById,
    });
    
    const savedJob = await this.jobRepo.save(job);
    
    // Queue the factory reset job for processing
    await this.provisioningService.queueProvisioningJob(savedJob.id);
    
    this.logger.log(`Factory reset job ${savedJob.id} created for device ${device.name}`);
    return savedJob;
  }

  async upgradeFirmware(id: string, ispId: string, data: {
    firmwareVersion: string;
    firmwareUrl: string;
    notes?: string;
    createdById?: string;
  }): Promise<FirmwareUpgrade> {
    const device = await this.getDeviceById(id, ispId);
    
    // Create firmware upgrade
    const upgrade = this.upgradeRepo.create({
      deviceId: device.id,
      firmwareVersion: data.firmwareVersion,
      firmwareUrl: data.firmwareUrl,
      status: UpgradeStatus.PENDING,
      notes: data.notes,
      createdById: data.createdById,
    });
    
    const savedUpgrade = await this.upgradeRepo.save(upgrade);
    
    // Update device status
    device.status = DeviceStatus.UPGRADING;
    await this.deviceRepo.save(device);
    
    // Queue the firmware upgrade for processing
    await this.provisioningService.queueFirmwareUpgrade(savedUpgrade.id);
    
    this.logger.log(`Firmware upgrade ${savedUpgrade.id} created for device ${device.name}`);
    return savedUpgrade;
  }

  // ==================== Device Profiles ====================

  async getAllProfiles(ispId: string): Promise<DeviceProfile[]> {
    return this.profileRepo.find({ 
      where: { ispId },
      order: { name: 'ASC' },
    });
  }

  async getProfileById(id: string, ispId: string): Promise<DeviceProfile> {
    const profile = await this.profileRepo.findOne({ where: { id, ispId } });
    
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    
    return profile;
  }

  async createProfile(data: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
    ispId: string;
    deviceType?: string;
    manufacturer?: string;
    model?: string;
  }): Promise<DeviceProfile> {
    // Check if profile with same name already exists for this ISP
    const existing = await this.profileRepo.findOne({ 
      where: { name: data.name, ispId: data.ispId } 
    });
    
    if (existing) {
      throw new BadRequestException(`Profile with name ${data.name} already exists`);
    }
    
    const profile = this.profileRepo.create(data);
    const savedProfile = await this.profileRepo.save(profile);
    
    this.logger.log(`Profile ${savedProfile.name} created for ISP ${data.ispId}`);
    return savedProfile;
  }

  async updateProfile(id: string, ispId: string, data: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const profile = await this.getProfileById(id, ispId);
    
    // If changing name, check for duplicates
    if (data.name && data.name !== profile.name) {
      const existing = await this.profileRepo.findOne({ 
        where: { name: data.name, ispId } 
      });
      
      if (existing) {
        throw new BadRequestException(`Profile with name ${data.name} already exists`);
      }
    }
    
    // Update profile
    Object.assign(profile, data);
    const updated = await this.profileRepo.save(profile);
    
    this.logger.log(`Profile ${updated.name} updated`);
    return updated;
  }

  async deleteProfile(id: string, ispId: string): Promise<void> {
    const profile = await this.getProfileById(id, ispId);
    
    // Check if any devices are using this profile
    const devicesUsingProfile = await this.deviceRepo.count({ 
      where: { profileId: id } 
    });
    
    if (devicesUsingProfile > 0) {
      throw new BadRequestException(`Cannot delete profile ${profile.name} as it is used by ${devicesUsingProfile} devices`);
    }
    
    await this.profileRepo.remove(profile);
    this.logger.log(`Profile ${profile.name} deleted`);
  }

  // ==================== Device Parameters ====================

  async getDeviceParameters(deviceId: string, ispId: string): Promise<DeviceParameter[]> {
    // Verify device exists and belongs to ISP
    await this.getDeviceById(deviceId, ispId);
    
    return this.parameterRepo.find({ 
      where: { deviceId },
      order: { name: 'ASC' },
    });
  }

  async updateDeviceParameter(deviceId: string, ispId: string, paramName: string, value: string): Promise<DeviceParameter> {
    // Verify device exists and belongs to ISP
    await this.getDeviceById(deviceId, ispId);
    
    // Find parameter
    const parameter = await this.parameterRepo.findOne({ 
      where: { deviceId, name: paramName } 
    });
    
    if (!parameter) {
      throw new NotFoundException(`Parameter ${paramName} not found for device ${deviceId}`);
    }
    
    if (!parameter.writable) {
      throw new BadRequestException(`Parameter ${paramName} is not writable`);
    }
    
    // Update parameter
    parameter.value = value;
    parameter.lastUpdated = new Date();
    
    const updated = await this.parameterRepo.save(parameter);
    this.logger.log(`Parameter ${paramName} updated for device ${deviceId}`);
    
    // Create parameter update job
    await this.provisioningService.updateDeviceParameter(deviceId, paramName, value);
    
    return updated;
  }

  // ==================== Jobs and Upgrades ====================

  async getDeviceJobs(deviceId: string, ispId: string, status?: JobStatus): Promise<ProvisioningJob[]> {
    // Verify device exists and belongs to ISP
    await this.getDeviceById(deviceId, ispId);
    
    const where: FindOptionsWhere<ProvisioningJob> = { deviceId };
    if (status) where.status = status;
    
    return this.jobRepo.find({ 
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getDeviceUpgrades(deviceId: string, ispId: string, status?: UpgradeStatus): Promise<FirmwareUpgrade[]> {
    // Verify device exists and belongs to ISP
    await this.getDeviceById(deviceId, ispId);
    
    const where: FindOptionsWhere<FirmwareUpgrade> = { deviceId };
    if (status) where.status = status;
    
    return this.upgradeRepo.find({ 
      where,
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== Monitoring ====================

  async getDeviceStatus(id: string, ispId: string): Promise<{
    device: Device;
    parameters: DeviceParameter[];
    lastJob?: ProvisioningJob;
    lastUpgrade?: FirmwareUpgrade;
    metrics?: any;
  }> {
    const device = await this.getDeviceById(id, ispId);
    
    const [parameters, jobs, upgrades, metrics] = await Promise.all([
      this.parameterRepo.find({ 
        where: { deviceId: id },
        order: { name: 'ASC' },
      }),
      this.jobRepo.find({ 
        where: { deviceId: id },
        order: { createdAt: 'DESC' },
        take: 1,
      }),
      this.upgradeRepo.find({ 
        where: { deviceId: id },
        order: { createdAt: 'DESC' },
        take: 1,
      }),
      this.monitoringService.getDeviceMetrics(id),
    ]);
    
    return {
      device,
      parameters,
      lastJob: jobs.length > 0 ? jobs[0] : undefined,
      lastUpgrade: upgrades.length > 0 ? upgrades[0] : undefined,
      metrics,
    };
  }
}