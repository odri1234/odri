import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Anomaly } from './entities/anomaly.entity';
import { Prediction, PredictionType } from './entities/prediction.entity';
import { AiModel, ModelType } from './entities/ai-model.entity';

import { AnomalyType } from './constants/anomaly.constants';

import { AnomalyAlertDto } from './dto/anomaly-alert.dto';
import { PredictionDto } from './dto/prediction.dto';
import { PricingSuggestionDto } from './dto/pricing-suggestion.dto';

import { PricingService } from './dynamic-pricing/pricing.service';
import { AnomalyService } from './anomaly-detection/anomaly.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(Anomaly)
    private readonly anomalyRepo: Repository<Anomaly>,

    @InjectRepository(Prediction)
    private readonly predictionRepo: Repository<Prediction>,

    @InjectRepository(AiModel)
    private readonly modelRepo: Repository<AiModel>,

    private readonly pricingService: PricingService,
    private readonly anomalyService: AnomalyService,
  ) {}

  /**
   * Handles incoming anomaly alerts by creating and saving anomaly records.
   */
  async handleAnomalyAlert(dto: AnomalyAlertDto): Promise<Anomaly> {
    this.logger.warn(`Anomaly Alert Triggered: ${dto.type} for actor ${dto.actorId}`);

    const anomalyData: DeepPartial<Anomaly> = {
      type: dto.type as AnomalyType,
      severity: dto.severity,
      description: dto.description,
      sessionId: dto.sessionId,
      actorId: dto.actorId,
      detectedAt: dto.detectedAt ?? new Date(),
    };

    const anomaly = this.anomalyRepo.create(anomalyData);
    return await this.anomalyRepo.save(anomaly);
  }

  /**
   * Saves a prediction record from a PredictionDto.
   * Wraps primitive result values in an object for consistency.
   */
  async savePrediction(dto: PredictionDto): Promise<Prediction> {
    this.logger.log(`Saving prediction for referenceId: ${dto.referenceId ?? 'N/A'}, type: ${dto.type}`);

    // Normalize result to always be an object for db storage
    const result =
      typeof dto.value === 'object' && dto.value !== null
        ? dto.value
        : { value: dto.value };

    const predictionData: DeepPartial<Prediction> = {
      type: dto.type,
      result,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : new Date(),
      referenceId: dto.referenceId,
      context: dto.explanation,
      unit: dto.unit ?? 'units',
      modelUsed: dto.modelUsed,
      // detectedAt left out to auto-set on insert
    };

    const prediction = this.predictionRepo.create(predictionData);
    return await this.predictionRepo.save(prediction);
  }

  /**
   * Creates a new prediction record with detailed information from PredictionDto.
   * Wraps primitive result values and lets TypeORM manage detectedAt timestamp.
   */
  async createPrediction(dto: PredictionDto): Promise<Prediction> {
    this.logger.log(`Creating prediction of type ${dto.type}`);

    const result =
      typeof dto.value === 'object' && dto.value !== null
        ? dto.value
        : { value: dto.value };

    const predictionData: DeepPartial<Prediction> = {
      type: dto.type,
      result,
      unit: dto.unit ?? 'units',
      context: dto.explanation,
      modelUsed: dto.modelUsed,
      referenceId: dto.referenceId,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : new Date(),
      // detectedAt is automatically handled by TypeORM @CreateDateColumn
    };

    const prediction = this.predictionRepo.create(predictionData);
    return await this.predictionRepo.save(prediction);
  }

  /**
   * Delegates pricing suggestion generation to the pricing service.
   */
  async generatePricingSuggestion(dto: PricingSuggestionDto): Promise<any> {
    return await this.pricingService.generateSuggestion(dto);
  }

  /**
   * Provides basic health check info for the AI service.
   */
  async healthCheck() {
    return {
      status: 'AI Engine OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Lists AI models optionally filtered by type.
   * Throws NotFoundException if no models found for specified type.
   */
  async listModels(type?: string): Promise<AiModel[]> {
    if (type) {
      const modelType = type as ModelType;
      const found = await this.modelRepo.find({ where: { type: modelType } });

      if (!found.length) {
        throw new NotFoundException(`No models found for type "${type}"`);
      }

      return found;
    }

    return await this.modelRepo.find();
  }
}
