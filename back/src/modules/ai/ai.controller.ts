import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Version, UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AnomalyAlertDto } from './dto/anomaly-alert.dto';
import { PredictionDto } from './dto/prediction.dto';
import { PricingSuggestionDto } from './dto/pricing-suggestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('anomaly/alert')
@ApiOperation({ summary: 'Trigger anomaly alert manually' })
  @ApiResponse({ status: 201, description: 'Anomaly recorded successfully' })
  async createAnomaly(@Body() dto: AnomalyAlertDto) {
    return this.aiService.handleAnomalyAlert(dto);
  }

  @Post('predict')
@ApiOperation({ summary: 'Trigger AI prediction (e.g., bandwidth or churn)' })
  @ApiResponse({ status: 201, description: 'Prediction stored successfully' })
  async predict(@Body() dto: PredictionDto) {
    return this.aiService.savePrediction(dto);
  }

  @Post('pricing/suggestion')
@ApiOperation({ summary: 'Request dynamic pricing recommendation' })
  @ApiResponse({ status: 200, description: 'Pricing suggestion generated' })
  @HttpCode(HttpStatus.OK)
  async getPricingSuggestion(@Body() dto: PricingSuggestionDto) {
    return this.aiService.generatePricingSuggestion(dto);
  }

  @Get('health')
@ApiOperation({ summary: 'Check AI engine health/status' })
  @ApiResponse({ status: 200, description: 'AI engine is running' })
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    return this.aiService.healthCheck();
  }

  @Get('models')
@ApiOperation({ summary: 'List available AI models' })
  @ApiResponse({ status: 200, description: 'List of models retrieved' })
  async listModels(@Query('type') type?: string) {
    return this.aiService.listModels(type);
  }
}
