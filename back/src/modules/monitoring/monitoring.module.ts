import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

import { AlertService } from './alert.service';  // Import AlertService

import { SystemMetric } from './entities/system-metric.entity';
import { Alert } from './entities/alert.entity';
import { HealthCheck } from './entities/health-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemMetric, Alert, HealthCheck])],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    AlertService,        // Add AlertService here
  ],
  exports: [
    MonitoringService,
    AlertService,        // Export AlertService so other modules can use it
  ],
})
export class MonitoringModule {}
