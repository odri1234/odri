import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { Tr069Controller } from './tr069.controller';
import { Tr069Service } from './tr069.service';
import { DeviceProvisioningService } from './services/device-provisioning.service';
import { DeviceMonitoringService } from './services/device-monitoring.service';
import { AcsConfigService } from './services/acs-config.service';

import { Device } from './entities/device.entity';
import { DeviceParameter } from './entities/device-parameter.entity';
import { DeviceProfile } from './entities/device-profile.entity';
import { ProvisioningJob } from './entities/provisioning-job.entity';
import { FirmwareUpgrade } from './entities/firmware-upgrade.entity';

import { NotificationsModule } from '../notifications/notifications.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Device,
      DeviceParameter,
      DeviceProfile,
      ProvisioningJob,
      FirmwareUpgrade,
    ]),
    HttpModule,
    ConfigModule,
    NotificationsModule,
    MonitoringModule,
  ],
  controllers: [Tr069Controller],
  providers: [
    Tr069Service,
    DeviceProvisioningService,
    DeviceMonitoringService,
    AcsConfigService,
  ],
  exports: [
    Tr069Service,
    DeviceProvisioningService,
  ],
})
export class Tr069Module {}