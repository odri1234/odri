import { IsUUID, IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PricingStrategy {
  STATIC = 'static',
  DEMAND_BASED = 'demand-based',
  TIME_BASED = 'time-based',
  COMPETITION_BASED = 'competition-based',
  AI_OPTIMIZED = 'ai-optimized',
}

export class PricingSuggestionDto {
  @ApiProperty({
    example: '93a2e378-1f3e-4a1d-9ed9-420bce56729d',
    description: 'Plan ID to which the suggestion applies',
  })
  @IsUUID()
  planId: string;

  @ApiProperty({
    example: 499.99,
    description: 'Suggested price in KES',
  })
  @IsNumber()
  suggestedPrice: number;

  @ApiProperty({
    example: 'Demand is high during evening hours; increase price slightly.',
    description: 'Explanation for the suggested pricing',
  })
  @IsString()
  @IsOptional()
  rationale?: string;

  @ApiProperty({
    enum: PricingStrategy,
    example: PricingStrategy.DEMAND_BASED,
    description: 'AI-based pricing strategy used',
  })
  @IsEnum(PricingStrategy)
  @IsOptional()
  strategy?: PricingStrategy;

  @ApiProperty({
    example: '2025-07-11T18:00:00Z',
    description: 'Timestamp the price suggestion is valid from',
  })
  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @ApiProperty({
    example: '2025-07-11T23:59:59Z',
    description: 'Timestamp until the suggested price is valid',
  })
  @IsDateString()
  @IsOptional()
  effectiveTo?: string;
}
