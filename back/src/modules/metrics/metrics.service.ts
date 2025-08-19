import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { MetricType } from './metric-type.enum';
import { CreateMetricDto } from './dto/create-metric.dto';
import { RevenueMetric } from './entities/revenue-metric.entity';
import { UsageMetric } from './entities/usage-metric.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(RevenueMetric)
    private readonly revenueRepo: Repository<RevenueMetric>,

    @InjectRepository(UsageMetric)
    private readonly usageRepo: Repository<UsageMetric>,
  ) {}

  async create(dto: CreateMetricDto) {
    const repo = this.getRepo(dto.type);

    const dateOnly = dto.timestamp.split('T')[0];
    const record = repo.create({
      isp: { id: dto.ispId } as any,
      ...(dto.type === MetricType.REVENUE
        ? { totalRevenue: dto.value }
        : { totalDataUsedMB: dto.value }),
      date: dateOnly,
    });

    return await repo.save(record);
  }

  async getSummary(
    ispId: string,
    type: MetricType,
    start: string,
    end: string,
  ) {
    const repo = this.getRepo(type);

    const startDate = start.split('T')[0];
    const endDate = end.split('T')[0];

    return await repo.find({
      where: {
        isp: { id: ispId } as any,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  private getRepo(type: MetricType): Repository<RevenueMetric | UsageMetric> {
    if (type === MetricType.REVENUE) return this.revenueRepo;
    if (type === MetricType.USAGE) return this.usageRepo;
    throw new BadRequestException(`Unsupported metric type: ${type}`);
  }
}
