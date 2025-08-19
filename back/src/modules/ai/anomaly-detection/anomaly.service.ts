import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anomaly } from '../entities/anomaly.entity';
import { AnomalyType, AnomalySeverity } from '../constants/anomaly.constants';
import { Session } from '../../sessions/entities/session.entity';
import { UsageLog } from '../../sessions/entities/usage-log.entity';
import { MonitoringService } from '../../monitoring/monitoring.service';

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,

    @InjectRepository(UsageLog)
    private readonly usageLogRepo: Repository<UsageLog>,

    @InjectRepository(Anomaly)
    private readonly anomalyRepo: Repository<Anomaly>,

    private readonly monitoringService: MonitoringService,
  ) {}

  /**
   * Detect usage anomalies across recent sessions.
   * Checks for sudden spikes in data usage compared to average usage.
   */
  async detectUsageAnomalies(): Promise<void> {
    const sessions = await this.sessionRepo.find({
      take: 100,
      order: { createdAt: 'DESC' },
      relations: ['user'], // preload user relation for actorId safely
    });

    for (const session of sessions) {
      const usageLogs = await this.usageLogRepo.find({
        where: { sessionId: session.id },
        order: { timestamp: 'DESC' },
        take: 5,
      });

      if (usageLogs.length === 0) continue;

      const avgData = this.calculateAverageUsage(usageLogs);
      const last = usageLogs[0];

      // Anomaly rule: sudden spike in usage (> 2x average)
      if (last && avgData > 0 && last.dataUsed > avgData * 2) {
        await this.reportAnomaly({
          sessionId: session.id,
          actorId: session.user?.id ?? 'unknown',
          actorType: 'client',
          type: AnomalyType.USAGE_SPIKE,
          severity: AnomalySeverity.MEDIUM,
          description: `Data usage ${last.dataUsed}MB exceeded 2x average (${avgData.toFixed(2)}MB)`,
        });
      }
    }
  }

  /**
   * Create anomaly record and trigger system alert.
   */
  private async reportAnomaly(data: {
    sessionId: string;
    actorId: string;
    actorType: 'client' | 'admin' | 'router';
    type: AnomalyType;
    description: string;
    severity?: AnomalySeverity;
  }): Promise<void> {
    const anomaly = this.anomalyRepo.create({
      sessionId: data.sessionId,
      actorId: data.actorId,
      actorType: data.actorType,
      type: data.type,
      description: data.description,
      severity: data.severity ?? AnomalySeverity.MEDIUM,
      detectedAt: new Date(),
      resolved: false,
      detectedBy: 'auto',
      status: 'pending',
    });

    await this.anomalyRepo.save(anomaly);

    await this.monitoringService.createSystemAlert({
      title: 'Anomaly Detected',
      message: data.description,
      severity: 'warning',
    });

    this.logger.warn(`[ANOMALY] ${data.description}`);
  }

  /**
   * Calculate average data usage from usage logs.
   */
  private calculateAverageUsage(logs: UsageLog[]): number {
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + Number(log.dataUsed), 0);
    return total / logs.length;
  }

  /**
   * Mark an anomaly as resolved.
   */
  async resolveAnomaly(id: string): Promise<Anomaly | null> {
    const anomaly = await this.anomalyRepo.findOne({ where: { id } });
    if (!anomaly) return null;

    anomaly.resolved = true;
    anomaly.resolvedAt = new Date();

    return this.anomalyRepo.save(anomaly);
  }
}
