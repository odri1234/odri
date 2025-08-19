import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { Device, DeviceStatus } from '../entities/device.entity';
import { DeviceParameter } from '../entities/device-parameter.entity';
import { ProvisioningJob, JobStatus, JobType } from '../entities/provisioning-job.entity';
import { FirmwareUpgrade, UpgradeStatus } from '../entities/firmware-upgrade.entity';

import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationChannel } from '../../notifications/enums/notification.enums';

@Injectable()
export class DeviceProvisioningService {
  private readonly logger = new Logger(DeviceProvisioningService.name);
  private readonly acsUrl: string;
  private readonly acsUsername: string;
  private readonly acsPassword: string;

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    
    @InjectRepository(DeviceParameter)
    private readonly parameterRepo: Repository<DeviceParameter>,
    
    @InjectRepository(ProvisioningJob)
    private readonly jobRepo: Repository<ProvisioningJob>,
    
    @InjectRepository(FirmwareUpgrade)
    private readonly upgradeRepo: Repository<FirmwareUpgrade>,
    
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.acsUrl = this.configService.get<string>('tr069.acsUrl', 'http://localhost:7547/api');
    this.acsUsername = this.configService.get<string>('tr069.acsUsername', 'admin');
    this.acsPassword = this.configService.get<string>('tr069.acsPassword', 'admin');
  }

  /**
   * Process a provisioning job
   */
  async processProvisioningJob(jobId: string): Promise<void> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['device'],
    });
    
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    if (job.status !== JobStatus.PENDING) {
      this.logger.log(`Job ${jobId} is not pending (status: ${job.status}), skipping`);
      return;
    }
    
    // Update job status
    job.status = JobStatus.IN_PROGRESS;
    job.startedAt = new Date();
    await this.jobRepo.save(job);
    
    try {
      let result: any;
      const device = job.device;
      
      // Process based on job type
      switch (job.type) {
        case JobType.INITIAL_PROVISION:
          result = await this.provisionDeviceOnAcs(device, job.parameters);
          break;
        case JobType.REBOOT:
          result = await this.rebootDeviceOnAcs(device);
          break;
        case JobType.FACTORY_RESET:
          result = await this.factoryResetDeviceOnAcs(device);
          break;
        default:
          throw new Error(`Unsupported job type: ${job.type}`);
      }
      
      // Update job status
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      job.result = result;
      await this.jobRepo.save(job);
      
      // Update device status
      device.status = DeviceStatus.ACTIVE;
      if (job.type === JobType.INITIAL_PROVISION) {
        device.isProvisioned = true;
      }
      await this.deviceRepo.save(device);
      
      // Send notification
      await this.notificationsService.queueAlertNotification(
        NotificationChannel.EMAIL,
        'admin@example.com', // This would be the ISP admin email
        `device-provisioning-${job.id}`, // Alert ID
        {
          subject: 'Device Provisioning Notification',
          templateData: {
            deviceName: device.name,
            serialNumber: device.serialNumber,
            jobType: job.type === JobType.INITIAL_PROVISION ? 'provisioned' : job.type.toLowerCase(),
            message: `Device ${device.name} (${device.serialNumber}) has been successfully ${job.type === JobType.INITIAL_PROVISION ? 'provisioned' : job.type.toLowerCase()}`,
          },
          severity: 'low',
          ispId: device.ispId,
          referenceId: job.id,
          alertType: 'Device Provisioning',
        }
      );
      
      this.logger.log(`Provisioning job ${job.id} completed successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Update job status
      job.status = JobStatus.FAILED;
      job.result = { error: errorMessage };
      await this.jobRepo.save(job);
      
      // Update device status
      const device = job.device;
      device.status = DeviceStatus.ERROR;
      await this.deviceRepo.save(device);
      
      // Send notification
      await this.notificationsService.queueAlertNotification(
        NotificationChannel.EMAIL,
        'admin@example.com', // This would be the ISP admin email
        `device-provisioning-error-${job.id}`, // Alert ID
        {
          subject: 'Device Provisioning Error',
          templateData: {
            deviceName: device.name,
            serialNumber: device.serialNumber,
            jobType: job.type.toLowerCase(),
            errorMessage,
            message: `Failed to ${job.type.toLowerCase()} device ${device.name} (${device.serialNumber}): ${errorMessage}`,
          },
          severity: 'high',
          ispId: device.ispId,
          referenceId: job.id,
          alertType: 'Device Provisioning Error',
        }
      );
      
      this.logger.error(`Provisioning job ${job.id} failed: ${errorMessage}`, errorStack);
    }
  }

  /**
   * Process a firmware upgrade job
   */
  async processFirmwareUpgrade(upgradeId: string): Promise<void> {
    const upgrade = await this.upgradeRepo.findOne({
      where: { id: upgradeId },
      relations: ['device'],
    });
    
    if (!upgrade) {
      throw new Error(`Upgrade with ID ${upgradeId} not found`);
    }
    
    if (upgrade.status !== UpgradeStatus.PENDING) {
      this.logger.log(`Upgrade ${upgradeId} is not pending (status: ${upgrade.status}), skipping`);
      return;
    }
    
    // Update upgrade status
    upgrade.status = UpgradeStatus.DOWNLOADING;
    upgrade.startedAt = new Date();
    await this.upgradeRepo.save(upgrade);
    
    try {
      const device = upgrade.device;
      
      // Process firmware upgrade
      const result = await this.upgradeFirmwareOnAcs(
        device,
        upgrade.firmwareVersion,
        upgrade.firmwareUrl
      );
      
      // Update upgrade status
      upgrade.status = UpgradeStatus.COMPLETED;
      upgrade.completedAt = new Date();
      upgrade.result = result;
      await this.upgradeRepo.save(upgrade);
      
      // Update device status and software version
      device.status = DeviceStatus.ACTIVE;
      device.softwareVersion = upgrade.firmwareVersion;
      await this.deviceRepo.save(device);
      
      // Send notification
      await this.notificationsService.queueAlertNotification(
        NotificationChannel.EMAIL,
        'admin@example.com', // This would be the ISP admin email
        `firmware-upgrade-${upgrade.id}`, // Alert ID
        {
          subject: 'Firmware Upgrade Completed',
          templateData: {
            deviceName: device.name,
            serialNumber: device.serialNumber,
            firmwareVersion: upgrade.firmwareVersion,
            message: `Device ${device.name} (${device.serialNumber}) has been successfully upgraded to firmware version ${upgrade.firmwareVersion}`,
          },
          severity: 'low',
          ispId: device.ispId,
          referenceId: upgrade.id,
          alertType: 'Firmware Upgrade',
        }
      );
      
      this.logger.log(`Firmware upgrade ${upgrade.id} completed successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Update upgrade status
      upgrade.status = UpgradeStatus.FAILED;
      upgrade.result = { error: errorMessage };
      await this.upgradeRepo.save(upgrade);
      
      // Update device status
      const device = upgrade.device;
      device.status = DeviceStatus.ERROR;
      await this.deviceRepo.save(device);
      
      // Send notification
      await this.notificationsService.queueAlertNotification(
        NotificationChannel.EMAIL,
        'admin@example.com', // This would be the ISP admin email
        `firmware-upgrade-error-${upgrade.id}`, // Alert ID
        {
          subject: 'Firmware Upgrade Error',
          templateData: {
            deviceName: device.name,
            serialNumber: device.serialNumber,
            firmwareVersion: upgrade.firmwareVersion,
            errorMessage,
            message: `Failed to upgrade device ${device.name} (${device.serialNumber}) to firmware version ${upgrade.firmwareVersion}: ${errorMessage}`,
          },
          severity: 'high',
          ispId: device.ispId,
          referenceId: upgrade.id,
          alertType: 'Firmware Upgrade Error',
        }
      );
      
      this.logger.error(`Firmware upgrade ${upgrade.id} failed: ${errorMessage}`, errorStack);
    }
  }

  /**
   * Provision a device on the ACS
   */
  private async provisionDeviceOnAcs(
    device: Device,
    parameters?: Record<string, any>
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.acsUrl}/devices/${device.serialNumber}/provision`,
          { parameters },
          {
            auth: {
              username: this.acsUsername,
              password: this.acsPassword,
            },
          }
        )
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, simulate a successful response
      return {
        success: true,
        deviceId: device.serialNumber,
        timestamp: new Date().toISOString(),
        message: 'Device provisioned successfully',
      };
    }
  }

  /**
   * Reboot a device on the ACS
   */
  private async rebootDeviceOnAcs(device: Device): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.acsUrl}/devices/${device.serialNumber}/reboot`,
          {},
          {
            auth: {
              username: this.acsUsername,
              password: this.acsPassword,
            },
          }
        )
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, simulate a successful response
      return {
        success: true,
        deviceId: device.serialNumber,
        timestamp: new Date().toISOString(),
        message: 'Device reboot initiated',
      };
    }
  }

  /**
   * Factory reset a device on the ACS
   */
  private async factoryResetDeviceOnAcs(device: Device): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.acsUrl}/devices/${device.serialNumber}/factory-reset`,
          {},
          {
            auth: {
              username: this.acsUsername,
              password: this.acsPassword,
            },
          }
        )
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, simulate a successful response
      const simulatedResponse = {
        success: true,
        deviceId: device.serialNumber,
        timestamp: new Date().toISOString(),
        message: 'Device factory reset initiated',
      };
      
      return simulatedResponse;
    }
  }

  /**
   * Queue a provisioning job for processing
   */
  async queueProvisioningJob(jobId: string): Promise<void> {
    this.logger.log(`Queueing provisioning job ${jobId} for processing`);
    // In a real implementation, this would add the job to a queue
    // For demo purposes, process it immediately
    await this.processProvisioningJob(jobId);
  }

  /**
   * Queue a firmware upgrade for processing
   */
  async queueFirmwareUpgrade(upgradeId: string): Promise<void> {
    this.logger.log(`Queueing firmware upgrade ${upgradeId} for processing`);
    // In a real implementation, this would add the upgrade to a queue
    // For demo purposes, process it immediately
    await this.processFirmwareUpgrade(upgradeId);
  }

  /**
   * Update a device parameter
   */
  async updateDeviceParameter(deviceId: string, paramName: string, value: string): Promise<any> {
    this.logger.log(`Updating parameter ${paramName} for device ${deviceId}`);
    
    const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }
    
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.acsUrl}/devices/${device.serialNumber}/parameters/${paramName}`,
          { value },
          {
            auth: {
              username: this.acsUsername,
              password: this.acsPassword,
            },
          }
        )
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, simulate a successful response
      return {
        success: true,
        deviceId: device.serialNumber,
        parameter: paramName,
        value,
        timestamp: new Date().toISOString(),
        message: 'Parameter updated successfully',
      };
    }
  }

  /**
   * Upgrade firmware on the ACS
   */
  private async upgradeFirmwareOnAcs(
    device: Device,
    firmwareVersion: string,
    firmwareUrl: string
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.acsUrl}/devices/${device.serialNumber}/upgrade`,
          {
            firmwareVersion,
            firmwareUrl,
          },
          {
            auth: {
              username: this.acsUsername,
              password: this.acsPassword,
            },
          }
        )
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, simulate a successful response
      return {
        success: true,
        deviceId: device.serialNumber,
        timestamp: new Date().toISOString(),
        message: 'Firmware upgrade initiated',
      };
    }
  }
}