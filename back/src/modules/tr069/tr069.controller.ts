import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from '../../common/decorators/request.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

import { Tr069Service } from './tr069.service';
import { DeviceProvisioningService } from './services/device-provisioning.service';
import { DeviceMonitoringService } from './services/device-monitoring.service';
import { AcsConfigService } from './services/acs-config.service';

import { Device, DeviceStatus, DeviceType } from './entities/device.entity';
import { DeviceParameter } from './entities/device-parameter.entity';
import { DeviceProfile } from './entities/device-profile.entity';
import { ProvisioningJob, JobStatus } from './entities/provisioning-job.entity';
import { FirmwareUpgrade, UpgradeStatus } from './entities/firmware-upgrade.entity';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../modules/users/constants/user-role.constants';

@ApiTags('TR-069')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tr069')
export class Tr069Controller {
  constructor(
    private readonly tr069Service: Tr069Service,
    private readonly provisioningService: DeviceProvisioningService,
    private readonly monitoringService: DeviceMonitoringService,
    private readonly acsConfigService: AcsConfigService,
  ) {}

  /**
   * Helper method to ensure ISP ID is available
   * For SUPER_ADMIN, we don't require an ISP ID and return 'all'
   */
  private ensureIspId(req: RequestWithUser): string {
    if (!req.user.ispId && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('ISP ID is required for this operation');
    }
    
    // For SUPER_ADMIN without an ISP ID, return 'all' to indicate all ISPs
    if (req.user.role === UserRole.SUPER_ADMIN && !req.user.ispId) {
      return 'all';
    }
    
    return req.user.ispId as string;
  }

  // ==================== Device Management ====================

  @Get('devices')
  @ApiOperation({ summary: 'Get all devices for ISP' })
  @ApiResponse({ status: 200, description: 'Returns all devices' })
  async getAllDevices(
    @Request() req: RequestWithUser,
    @Query('status') status?: DeviceStatus,
    @Query('type') type?: DeviceType,
    @Query('isOnline') isOnline?: boolean,
    @Query('isProvisioned') isProvisioned?: boolean,
    @Query('search') search?: string,
  ): Promise<Device[]> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getAllDevices(ispId, {
      status,
      type,
      isOnline: isOnline !== undefined ? isOnline === true : undefined,
      isProvisioned: isProvisioned !== undefined ? isProvisioned === true : undefined,
      search,
      userRole: req.user.role,
    });
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({ status: 200, description: 'Returns the device' })
  async getDeviceById(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Device> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getDeviceById(id, ispId);
  }

  @Post('devices')
  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, description: 'Device created successfully' })
  async createDevice(
    @Request() req: RequestWithUser,
    @Body() data: {
      name: string;
      serialNumber: string;
      macAddress?: string;
      type?: DeviceType;
      manufacturer?: string;
      model?: string;
      description?: string;
      profileId?: string;
      clientId?: string;
      locationId?: string;
    },
  ): Promise<Device> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.createDevice({
      ...data,
      ispId,
    });
  }

  @Put('devices/:id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  async updateDevice(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: Partial<Device>,
  ): Promise<Device> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.updateDevice(id, ispId, data);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiResponse({ status: 200, description: 'Device deleted successfully' })
  async deleteDevice(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.deleteDevice(id, ispId);
  }

  // ==================== Device Provisioning ====================

  @Post('devices/:id/provision')
  @ApiOperation({ summary: 'Provision a device' })
  @ApiResponse({ status: 200, description: 'Device provisioning job created' })
  async provisionDevice(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: {
      parameters?: Record<string, any>;
      notes?: string;
    },
  ): Promise<ProvisioningJob> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.provisionDevice(id, ispId, {
      ...data,
      createdById: req.user.id,
    });
  }

  @Post('devices/:id/reboot')
  @ApiOperation({ summary: 'Reboot a device' })
  @ApiResponse({ status: 200, description: 'Device reboot job created' })
  async rebootDevice(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: {
      notes?: string;
    },
  ): Promise<ProvisioningJob> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.rebootDevice(id, ispId, {
      ...data,
      createdById: req.user.id,
    });
  }

  @Post('devices/:id/factory-reset')
  @ApiOperation({ summary: 'Factory reset a device' })
  @ApiResponse({ status: 200, description: 'Device factory reset job created' })
  async factoryResetDevice(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: {
      notes?: string;
    },
  ): Promise<ProvisioningJob> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.factoryResetDevice(id, ispId, {
      ...data,
      createdById: req.user.id,
    });
  }

  @Post('devices/:id/upgrade')
  @ApiOperation({ summary: 'Upgrade device firmware' })
  @ApiResponse({ status: 200, description: 'Device firmware upgrade job created' })
  async upgradeFirmware(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: {
      firmwareVersion: string;
      firmwareUrl: string;
      notes?: string;
    },
  ): Promise<FirmwareUpgrade> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.upgradeFirmware(id, ispId, {
      ...data,
      createdById: req.user.id,
    });
  }

  // ==================== Device Parameters ====================

  @Get('devices/:id/parameters')
  @ApiOperation({ summary: 'Get device parameters' })
  @ApiResponse({ status: 200, description: 'Returns device parameters' })
  async getDeviceParameters(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<DeviceParameter[]> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getDeviceParameters(id, ispId);
  }

  @Put('devices/:id/parameters/:name')
  @ApiOperation({ summary: 'Update device parameter' })
  @ApiResponse({ status: 200, description: 'Parameter updated successfully' })
  async updateDeviceParameter(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('name') name: string,
    @Body() data: {
      value: string;
    },
  ): Promise<DeviceParameter> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.updateDeviceParameter(id, ispId, name, data.value);
  }

  // ==================== Device Profiles ====================

  @Get('profiles')
  @ApiOperation({ summary: 'Get all device profiles' })
  @ApiResponse({ status: 200, description: 'Returns all profiles' })
  async getAllProfiles(
    @Request() req: RequestWithUser,
  ): Promise<DeviceProfile[]> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getAllProfiles(ispId);
  }

  @Get('profiles/:id')
  @ApiOperation({ summary: 'Get profile by ID' })
  @ApiResponse({ status: 200, description: 'Returns the profile' })
  async getProfileById(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<DeviceProfile> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getProfileById(id, ispId);
  }

  @Post('profiles')
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  async createProfile(
    @Request() req: RequestWithUser,
    @Body() data: {
      name: string;
      description?: string;
      parameters: Record<string, any>;
      deviceType?: string;
      manufacturer?: string;
      model?: string;
    },
  ): Promise<DeviceProfile> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.createProfile({
      ...data,
      ispId,
    });
  }

  @Put('profiles/:id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() data: Partial<DeviceProfile>,
  ): Promise<DeviceProfile> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.updateProfile(id, ispId, data);
  }

  @Delete('profiles/:id')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  async deleteProfile(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.deleteProfile(id, ispId);
  }

  // ==================== Jobs and Upgrades ====================

  @Get('devices/:id/jobs')
  @ApiOperation({ summary: 'Get device jobs' })
  @ApiResponse({ status: 200, description: 'Returns device jobs' })
  async getDeviceJobs(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Query('status') status?: JobStatus,
  ): Promise<ProvisioningJob[]> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getDeviceJobs(id, ispId, status);
  }

  @Get('devices/:id/upgrades')
  @ApiOperation({ summary: 'Get device firmware upgrades' })
  @ApiResponse({ status: 200, description: 'Returns device firmware upgrades' })
  async getDeviceUpgrades(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Query('status') status?: UpgradeStatus,
  ): Promise<FirmwareUpgrade[]> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getDeviceUpgrades(id, ispId, status);
  }

  // ==================== Monitoring ====================

  @Get('devices/:id/status')
  @ApiOperation({ summary: 'Get device status' })
  @ApiResponse({ status: 200, description: 'Returns device status' })
  async getDeviceStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<any> {
    const ispId = this.ensureIspId(req);
    return this.tr069Service.getDeviceStatus(id, ispId);
  }

  @Get('devices/:id/check')
  @ApiOperation({ summary: 'Check device online status' })
  @ApiResponse({ status: 200, description: 'Returns device online status' })
  async checkDeviceStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<{ online: boolean }> {
    const ispId = this.ensureIspId(req);
    await this.tr069Service.getDeviceById(id, ispId); // Verify device exists and belongs to ISP
    const online = await this.monitoringService.checkDeviceStatus(id);
    return { online };
  }

  // ==================== ACS Configuration ====================

  @Get('acs/config')
  @ApiOperation({ summary: 'Get ACS configuration' })
  @ApiResponse({ status: 200, description: 'Returns ACS configuration' })
  @Roles(UserRole.SUPER_ADMIN)
  async getAcsConfig(): Promise<any> {
    return this.acsConfigService.getAcsConfig();
  }

  @Put('acs/config')
  @ApiOperation({ summary: 'Update ACS configuration' })
  @ApiResponse({ status: 200, description: 'ACS configuration updated successfully' })
  @Roles(UserRole.SUPER_ADMIN)
  async updateAcsConfig(
    @Body() config: Record<string, any>,
  ): Promise<any> {
    return this.acsConfigService.updateAcsConfig(config);
  }

  @Get('acs/stats')
  @ApiOperation({ summary: 'Get ACS statistics' })
  @ApiResponse({ status: 200, description: 'Returns ACS statistics' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getAcsStats(): Promise<any> {
    return this.acsConfigService.getAcsStats();
  }

  @Get('acs/models')
  @ApiOperation({ summary: 'Get supported device models' })
  @ApiResponse({ status: 200, description: 'Returns supported device models' })
  async getSupportedModels(): Promise<any[]> {
    return this.acsConfigService.getSupportedModels();
  }
}