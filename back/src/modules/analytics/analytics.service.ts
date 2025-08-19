import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { AnalyticsReport } from './entities/analytics-report.entity';
import { RevenueMetric } from './entities/revenue-metric.entity';
import { UsageMetric } from './entities/usage-metric.entity';
import { ReportRequestDto } from './dto/report-request.dto';
import { RevenueSummaryDto } from './dto/revenue-summary.dto';
import { UsageSummaryDto } from './dto/usage-summary.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsReport)
    private readonly reportRepo: Repository<AnalyticsReport>,

    @InjectRepository(RevenueMetric)
    private readonly revenueRepo: Repository<RevenueMetric>,

    @InjectRepository(UsageMetric)
    private readonly usageRepo: Repository<UsageMetric>,
  ) {}

  async generateReport(dto: ReportRequestDto): Promise<AnalyticsReport> {
    if (!dto.startDate || !dto.endDate || !dto.generatedBy) {
      throw new BadRequestException('Missing required fields: startDate, endDate, generatedBy');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const report = this.reportRepo.create({
      type: dto.type || 'general',
      startDate,
      endDate,
      generatedBy: { id: dto.generatedBy } as any,  // Assuming generatedBy is a User ID; adjust if needed
      status: 'PENDING',
      frequency: 'on-demand',
      data: {}, // initial empty data placeholder
    });

    return this.reportRepo.save(report);
  }

  async getRevenueSummary(query: ReportRequestDto): Promise<RevenueSummaryDto> {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Format dates as 'YYYY-MM-DD' for Between operator
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Current period data
    const currentData = await this.revenueRepo.find({
      where: { date: Between(startStr, endStr) },
    });

    // Previous period for growth rate calculation
    const diff = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - diff);
    const previousEndDate = new Date(endDate.getTime() - diff);

    const prevStartStr = previousStartDate.toISOString().split('T')[0];
    const prevEndStr = previousEndDate.toISOString().split('T')[0];

    const previousData = await this.revenueRepo.find({
      where: { date: Between(prevStartStr, prevEndStr) },
    });

    const totalRevenue = currentData.reduce((acc, metric) => acc + Number(metric.totalRevenue), 0);
    const transactionCount = currentData.reduce((acc, metric) => acc + metric.numberOfTransactions, 0);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverageRevenue = totalRevenue / days;

    const previousTotalRevenue = previousData.reduce((acc, metric) => acc + Number(metric.totalRevenue), 0);
    const growthRate = previousTotalRevenue === 0
      ? 100
      : ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100;

    return {
      totalRevenue,
      currency: currentData.length ? currentData[0].currency : 'KES',
      transactionCount,
      averageRevenuePerUser: currentData.length ? totalRevenue / currentData.length : 0,
      growthRate,
      dailyAverageRevenue,
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    };
  }

  async getUsageSummary(query: ReportRequestDto): Promise<UsageSummaryDto> {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const data = await this.usageRepo.find({
      where: { date: Between(startStr, endStr) },
    });

    const totalDataUsageMB = data.reduce((acc, metric) => acc + Number(metric.totalDataUsedMB), 0);
    const totalSessions = data.reduce((acc, metric) => acc + metric.activeSessions, 0);
    const totalSessionDuration = data.reduce((acc, metric) => acc + (metric.averageSessionDurationMinutes * metric.activeSessions), 0);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Peak usage hour calculation: find hour with max total sessions
    const peakHourMap = new Map<number, number>(); // hour -> sessions
    data.forEach(metric => {
      const current = peakHourMap.get(metric.peakUsageHour) || 0;
      peakHourMap.set(metric.peakUsageHour, current + metric.activeSessions);
    });

    let peakUsageTime = '';
    let maxSessions = 0;
    peakHourMap.forEach((sessions, hour) => {
      if (sessions > maxSessions) {
        maxSessions = sessions;
        peakUsageTime = `${hour}:00-${hour + 1}:00`;
      }
    });

    return {
      totalDataUsageMB,
      sessionCount: totalSessions,
      averageSessionDuration: totalSessions ? totalSessionDuration / totalSessions : 0,
      peakUsageTime,
      averageUsagePerUserMB: data.length ? totalDataUsageMB / data.length : 0,
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    };
  }

  async generateFullReport(query: ReportRequestDto): Promise<AnalyticsReport> {
    // Extend to combine summaries or additional data as needed
    return this.generateReport(query);
  }

  async listReports(): Promise<AnalyticsReport[]> {
    return this.reportRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getReportById(id: string): Promise<AnalyticsReport | null> {
    return this.reportRepo.findOne({ where: { id } });
  }

  async updateReportStatus(id: string, status: 'PENDING' | 'COMPLETED' | 'FAILED'): Promise<void> {
    await this.reportRepo.update(id, { status });
  }

  async deleteReport(id: string): Promise<void> {
    await this.reportRepo.delete(id);
  }

  async aggregateUsageMetrics(): Promise<void> {
    this.logger.log('Aggregating usage metrics...');
    // TODO: Implement aggregation logic here
  }

  async aggregateRevenueMetrics(): Promise<void> {
    this.logger.log('Aggregating revenue metrics...');
    // TODO: Implement aggregation logic here
  }

  async generateDailyReport(): Promise<void> {
    this.logger.log('Generating daily report...');
    // TODO: Implement daily report generation logic here
  }
}
