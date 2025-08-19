import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DeepPartial } from 'typeorm';

import { UsageLog } from '../../sessions/entities/usage-log.entity';
import { PredictionDto } from '../dto/prediction.dto';
import { Prediction, PredictionType } from '../entities/prediction.entity';

@Injectable()
export class DemandPredictionService {
  private readonly logger = new Logger(DemandPredictionService.name);

  constructor(
    @InjectRepository(UsageLog)
    private readonly usageLogRepo: Repository<UsageLog>,

    @InjectRepository(Prediction)
    private readonly predictionRepo: Repository<Prediction>,
  ) {}

  async predictDemandForNextHour(referenceId?: string | null): Promise<PredictionDto> {
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch usage logs for the last 7 days, filtered by referenceId if provided
      const logs = await this.usageLogRepo.find({
        where: {
          timestamp: Between(oneWeekAgo, now),
          ...(referenceId ? { routerId: referenceId } : {}),
        },
      });

      // Aggregate average usage by hour
      const usageByHour = this.aggregateHourlyUsage(logs);

      // Predict demand for the next hour
      const nextHour = (now.getHours() + 1) % 24;
      const predictedUsage = usageByHour[nextHour] ?? 0;

      // Prepare prediction entity data
      const predictionData: DeepPartial<Prediction> = {
        type: PredictionType.BANDWIDTH_FORECAST,
        value: predictedUsage,
        detectedAt: now,
        targetDate: new Date(now.getTime() + 60 * 60 * 1000), // next hour
        ...(referenceId !== null && referenceId !== undefined ? { referenceId } : {}),
      };

      // Create and save prediction record
      const prediction = this.predictionRepo.create(predictionData);
      await this.predictionRepo.save(prediction);

      this.logger.log(`Predicted ${predictedUsage} MB for hour ${nextHour}`);

      // Return data matching PredictionDto structure
      return {
  type: PredictionType.BANDWIDTH_FORECAST,
  value: predictedUsage,
  explanation: 'Predicted based on hourly average from past 7 days.',
  targetDate: prediction.targetDate.toISOString(),
  referenceId: referenceId ?? undefined,
};

    } catch (error: any) {
      this.logger.error(
        `Failed to generate demand prediction for referenceId=${referenceId ?? 'N/A'}`,
        error.stack || String(error),
      );
      throw error;
    }
  }

  // Helper: calculate average usage per hour from usage logs
  private aggregateHourlyUsage(logs: UsageLog[]): Record<number, number> {
    const usageByHour: Record<number, number[]> = {};

    for (const log of logs) {
      const hour = new Date(log.timestamp).getHours();
      if (!usageByHour[hour]) usageByHour[hour] = [];
      usageByHour[hour].push(log.dataUsed);
    }

    const averageByHour: Record<number, number> = {};
    for (const hourStr in usageByHour) {
      const hour = Number(hourStr);
      const values = usageByHour[hour];
      const sum = values.reduce((acc, val) => acc + val, 0);
      averageByHour[hour] = Math.round((sum / values.length) * 100) / 100;
    }

    return averageByHour;
  }
}
