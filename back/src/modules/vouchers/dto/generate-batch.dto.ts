import {
  IsInt,
  Min,
  IsEnum,
  IsUUID,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherValidityUnit } from '../enums/voucher.enums'; // ✅ Correct import path

export class GenerateBatchDto {
  @ApiProperty({
    description: 'Number of vouchers to generate in this batch',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  count!: number;

  @ApiProperty({
    description: 'Amount of data per voucher (in MB)',
    example: 1024,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({
    description: 'Validity unit (e.g., HOURS, DAYS, WEEKS)',
    enum: VoucherValidityUnit,
    example: VoucherValidityUnit.DAYS,
  })
  @IsEnum(VoucherValidityUnit)
  validityUnit!: VoucherValidityUnit;

  @ApiProperty({
    description: 'Duration of validity for each voucher',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  duration!: number;

  @ApiPropertyOptional({
    description: 'Optional prefix for voucher codes (e.g., for campaigns)',
    example: 'JULY24',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefix?: string;

  @ApiPropertyOptional({
    description: 'ISP ID for associating vouchers with a specific ISP',
    example: 'c5b9a67d-6dc2-49f4-9d1a-817d558441ff',
  })
  @IsOptional()
  @IsUUID()
  ispId?: string;

  @ApiPropertyOptional({
    description: 'Optional plan ID if vouchers are linked to a plan',
    example: '2f7fa437-d8c7-4e17-98a2-ef1a16b5d0b4',
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({
    description: 'Custom metadata for the batch (e.g., campaign name)',
    example: 'LaunchPromo_July2025',
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}
