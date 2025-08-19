import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Plan } from '../../plans/entities/plan.entity';
import { Prediction, PredictionType } from '../entities/prediction.entity';
import {
  PricingSuggestionDto,
  PricingStrategy,
} from '../dto/pricing-suggestion.dto';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,

    @InjectRepository(Prediction)
    private readonly predictionRepo: Repository<Prediction>,
  ) {}

  /**
   * Suggest dynamic pricing for all plans based on recent demand prediction.
   */
  async generateDynamicPricing(): Promise<PricingSuggestionDto[]> {
    const suggestions: PricingSuggestionDto[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const plans = await this.planRepo.find();

    for (const plan of plans) {
      const latestPrediction = await this.predictionRepo.findOne({
        where: {
          referenceId: plan.ispId,
          detectedAt: Between(oneHourAgo, now),
          type: PredictionType.BANDWIDTH_FORECAST,
        },
        order: { detectedAt: 'DESC' },
      });

      if (!latestPrediction) {
        this.logger.warn(
          `No recent prediction found for plan ${plan.name} (ISP: ${plan.ispId})`,
        );
        continue;
      }

      const demand = latestPrediction.value;
      const multiplier = this.calculateMultiplier(demand);
      const newPrice = parseFloat((plan.basePrice * multiplier).toFixed(2));

      const suggestion: PricingSuggestionDto = {
        planId: plan.id,
        suggestedPrice: newPrice,
        rationale: `Demand = ${demand} MB. Multiplier applied: ${multiplier}`,
        strategy: PricingStrategy.DEMAND_BASED,
        effectiveFrom: now.toISOString(),
        effectiveTo: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      };

      this.logger.log(`Suggested new price for ${plan.name}: KES ${newPrice}`);
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * Calculates price multiplier based on bandwidth demand.
   */
  private calculateMultiplier(demand: number): number {
    if (demand < 100) return 0.95;     // Low demand → slight discount
    if (demand < 300) return 1.0;      // Normal demand → base price
    if (demand < 500) return 1.1;      // High demand → slight increase
    return 1.25;                       // Very high demand → higher increase
  }

  /**
   * Placeholder for AI-based custom pricing suggestions.
   */
  async generateSuggestion(dto: any): Promise<{
    suggestedPrice: number;
    confidence: number;
    factors: any[];
    validUntil: Date;
  }> {
    return {
      suggestedPrice: 0,
      confidence: 0,
      factors: [],
      validUntil: new Date(),
    };
  }
}
