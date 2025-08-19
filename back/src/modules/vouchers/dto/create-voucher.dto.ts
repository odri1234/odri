import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherValidityUnit } from '../enums/voucher.enums'; // ⛏️ fix import path

export class CreateVoucherDto {
  @ApiPropertyOptional({
    description: 'Voucher code (optional - auto-generated if blank)',
    maxLength: 30,
    example: 'BEAST-2025-100MB',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;

  @ApiProperty({
    description: 'Amount in MB (e.g., 5000 = 5GB)',
    example: 5000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({
    enum: VoucherValidityUnit,
    example: VoucherValidityUnit.DAYS,
    description: 'Unit for validity period (HOURS, DAYS, WEEKS)',
  })
  @IsEnum(VoucherValidityUnit)
  validityUnit!: VoucherValidityUnit;

  @ApiProperty({
    description: 'Duration value for the voucher (e.g., 30 days)',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  duration!: number;

  @ApiPropertyOptional({
    description: 'ID of the ISP issuing the voucher',
    example: '7dbb4372-12fa-45e7-a812-b19d10f19f5e',
  })
  @IsOptional()
  @IsUUID()
  ispId?: string;

  @ApiPropertyOptional({
    description: 'ID of the plan this voucher is linked to',
    example: '9ac3ea9e-ff01-432e-9c21-c00d50ec8f01',
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Optional metadata or campaign info',
    example: 'Promo voucher for July',
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
