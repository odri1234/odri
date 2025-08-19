import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PredictionType } from '../entities/prediction.entity';

export class PredictionDto {
  @ApiProperty({
    enum: PredictionType,
    example: PredictionType.BANDWIDTH_FORECAST,
  })
  @IsEnum(PredictionType)
  @IsNotEmpty()
  type: PredictionType;

  @ApiProperty({
    example: 125.75,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    example: 'Predicted based on hourly average',
    required: false,
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({
    example: '2025-07-12T18:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @ApiProperty({
    example: 'ISP-123',
    required: false,
    description: 'Related session, router, or ISP ID as string',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  // Add these new fields:
  @ApiProperty({
    example: 'units',
    required: false,
    description: 'Unit of the prediction result (e.g., Mbps, users)',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    example: 'demand_predictor_v3',
    required: false,
    description: 'Name or identifier of the model used for prediction',
  })
  @IsOptional()
  @IsString()
  modelUsed?: string;
}
