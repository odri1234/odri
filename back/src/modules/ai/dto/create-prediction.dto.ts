import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { PredictionType } from '../entities/prediction.entity'; // ✅ Import the enum

export class CreatePredictionDto {
  @IsEnum(PredictionType)
  type: PredictionType;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  modelUsed?: string;
}
