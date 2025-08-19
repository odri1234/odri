import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entity
import { Anomaly } from '../entities/anomaly.entity';

// Constants for anomaly classification
import { AnomalyType, AnomalySeverity } from '../constants/anomaly.constants';

// Alert-related imports
import { AlertSeverity } from '../../monitoring/entities/alert.entity';
import { AlertType } from '../../monitoring/dto/alert.dto';
import { AlertService } from '../../monitoring/alert.service';

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  constructor(
    @InjectRepository(Anomaly)
    private readonly anomalyRepo: Repository<Anomaly>,

    private readonly alertService: AlertService,
  ) {}

  /**
   * Report detected fraud by creating an anomaly record
   * and sending an alert via the AlertService.
   */
  private async reportFraud(data: {
    type: AnomalyType;
    description: string;
    actorType?: 'client' | 'admin' | 'router';
    actorId?: string;
    sessionId?: string;
  }): Promise<void> {
    // Create anomaly entity with high severity
    const anomaly = this.anomalyRepo.create({
      type: data.type,
      description: data.description,
      severity: AnomalySeverity.HIGH,
      detectedAt: new Date(),
      resolved: false,
      detectedBy: 'auto',
      status: 'pending',
      actorType: data.actorType ?? 'client',
      actorId: data.actorId ?? 'unknown',
      sessionId: data.sessionId,
    });

    await this.anomalyRepo.save(anomaly);

    // Create system alert to notify monitoring system
    await this.alertService.createSystemAlert({
      title: `[FRAUD] ${data.type}`,
      message: data.description,
      severity: AlertSeverity.CRITICAL,
      type: AlertType.SYSTEM,
    });

    this.logger.error(`[FRAUD DETECTED] ${data.description}`);
  }
}
