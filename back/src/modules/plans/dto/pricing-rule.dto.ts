import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PricingRuleType {
  FLAT = 'flat',
  PERCENTAGE = 'percentage',
  TIERED = 'tiered',
}

export class PricingRuleDto {
  @ApiProperty({
    description: 'Type of pricing rule',
    enum: PricingRuleType,
    example: PricingRuleType.FLAT,
  })
  @IsEnum(PricingRuleType)
  type!: PricingRuleType; // ✅ definite assignment

  @ApiProperty({
    description: 'Value of the pricing rule',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  value!: number; // ✅ definite assignment

  @ApiProperty({
    description: 'Description of the pricing rule',
    example: '10% discount for early payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Minimum quantity or threshold for rule to apply',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minQuantity?: number;

  @ApiProperty({
    description: 'Maximum quantity or threshold for rule to apply',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxQuantity?: number;
}
