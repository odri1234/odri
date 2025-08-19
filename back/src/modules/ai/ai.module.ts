import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AiController } from './ai.controller';

// Services
import { AiService } from './ai.service';
import { AnomalyService } from './anomaly-detection/anomaly.service';
import { FraudDetectionService } from './anomaly-detection/fraud-detection.service';
import { PricingService } from './dynamic-pricing/pricing.service';
import { DemandPredictionService } from './dynamic-pricing/demand-prediction.service';
import { MaintenancePredictionService } from './predictive-maintenance/maintenance-prediction.service';

// Entities
import { Anomaly } from './entities/anomaly.entity';
import { Prediction } from './entities/prediction.entity';
import { AiModel } from './entities/ai-model.entity';
import { Session } from '../sessions/entities/session.entity';
import { UsageLog } from '../sessions/entities/usage-log.entity';
import { Plan } from '../plans/entities/plan.entity';
import { SystemMetric } from '../monitoring/entities/system-metric.entity';
import { Router } from '../mikrotik/entities/router.entity';
import { Device } from '../tr069/entities/device.entity';

// Repositories (custom)
import { AnomalyRepository } from './repositories/anomaly.repository';
import { PredictionRepository } from './repositories/prediction.repository';

// Feature Modules
import { SessionsModule } from '../sessions/sessions.module';
import { UsageModule } from '../usage/usage.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { PlansModule } from '../plans/plans.module';
import { MikroTikModule } from '../mikrotik/mikrotik.module';
import { Tr069Module } from '../tr069/tr069.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiModel,
      Prediction,
      Anomaly,
      Session,
      UsageLog,
      Plan,
      SystemMetric,
      Router,
      Device,
    ]),
    SessionsModule,
    UsageModule,
    MonitoringModule,
    PlansModule,
    MikroTikModule,
    Tr069Module,
    NotificationsModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AnomalyService,
    FraudDetectionService,
    PricingService,
    DemandPredictionService,
    MaintenancePredictionService,
    AnomalyRepository,
    PredictionRepository,
  ],
  exports: [
    AiService,
    AnomalyService,
    FraudDetectionService,
    PricingService,
    DemandPredictionService,
    MaintenancePredictionService,
    AnomalyRepository,
    PredictionRepository,
    TypeOrmModule,
  ],
})
export class AiModule {}
