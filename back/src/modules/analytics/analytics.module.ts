// analytics/analytics.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsReport } from './entities/analytics-report.entity';
import { RevenueMetric } from './entities/revenue-metric.entity';
import { UsageMetric } from './entities/usage-metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsReport,
      RevenueMetric,
      UsageMetric,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
