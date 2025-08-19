import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SystemMetric } from './entities/system-metric.entity';
import { Alert, AlertSeverity } from './entities/alert.entity';
import { HealthCheck } from './entities/health-check.entity';
import { MetricDto } from './dto/metric.dto';
import { HealthStatusDto } from './dto/health-status.dto';
import { AlertDto } from './dto/alert.dto';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(SystemMetric)
    private readonly metricsRepo: Repository<SystemMetric>,

    @InjectRepository(Alert)
    private readonly alertsRepo: Repository<Alert>,

    @InjectRepository(HealthCheck)
    private readonly healthRepo: Repository<HealthCheck>,
  ) {}

  async recordMetric(metricDto: MetricDto): Promise<SystemMetric> {
    const metric = this.metricsRepo.create(metricDto);
    return this.metricsRepo.save(metric);
  }

  async getMetrics(ispId?: string, metricType?: string, userRole?: string): Promise<SystemMetric[]> {
    const where: any = {};
    // Skip ispId filtering for SUPER_ADMIN role
    if (ispId && userRole !== 'SUPER_ADMIN') where.ispId = ispId;
    if (metricType) where.metricType = metricType;

    return this.metricsRepo.find({
      where,
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async getMetricTrends(metricType: string, ispId?: string, userRole?: string): Promise<SystemMetric[]> {
    const where: any = { metricType };
    // Skip ispId filtering for SUPER_ADMIN role
    if (ispId && userRole !== 'SUPER_ADMIN') where.ispId = ispId;

    return this.metricsRepo.find({
      where,
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }

  async logHealthStatus(healthDto: HealthStatusDto): Promise<HealthCheck> {
    const health = this.healthRepo.create(healthDto);
    return this.healthRepo.save(health);
  }

  async getLatestHealthStatus(ispId?: string, userRole?: string): Promise<HealthCheck[]> {
    const where: any = {};
    // Skip ispId filtering for SUPER_ADMIN role
    if (ispId && userRole !== 'SUPER_ADMIN') where.ispId = ispId;

    return this.healthRepo.find({
      where,
      order: { checkedAt: 'DESC' },
      take: 10,
    });
  }

  async createAlert(alertDto: AlertDto): Promise<Alert> {
    const alert = this.alertsRepo.create({
      ...alertDto,
      severity: alertDto.severity as AlertSeverity,
    });
    return this.alertsRepo.save(alert);
  }

  async getActiveAlerts(ispId?: string, userRole?: string): Promise<Alert[]> {
    const where: any = { resolved: false };
    
    // Use proper relation filtering for isp
    // Skip ispId filtering for SUPER_ADMIN role
    if (ispId && userRole !== 'SUPER_ADMIN') {
      return this.alertsRepo.find({
        where: {
          resolved: false,
          isp: { id: ispId }
        },
        relations: ['isp'],
        order: { createdAt: 'DESC' },
      });
    }
    
    return this.alertsRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async resolveAlert(id: string): Promise<Alert> {
    const alert = await this.alertsRepo.findOneBy({ id });
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }
    alert.resolved = true;
    alert.resolvedAt = new Date();
    return this.alertsRepo.save(alert);
  }

  async purgeOldMetrics(days: number): Promise<void> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    await this.metricsRepo.delete({
      timestamp: LessThan(cutoff),
    });
  }

  async purgeOldHealthChecks(days: number): Promise<void> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    await this.healthRepo.delete({
      checkedAt: LessThan(cutoff),
    });
  }

  // <-- Added Missing Method -->
  async createSystemAlert(alertData: {
    title: string;
    message: string;
    severity: string;
  }): Promise<void> {
    this.logger.warn(`[ALERT] ${alertData.title}: ${alertData.message} (Severity: ${alertData.severity})`);
    // Add your actual alert creation logic here (e.g., save to DB, send notification, etc.)
  }
}
