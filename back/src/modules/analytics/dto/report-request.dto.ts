import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportRequestDto {
  @ApiPropertyOptional({
    description: 'Report type (e.g., usage, revenue, system)',
    example: 'usage',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'UUID of the user who generated the report',
    example: 'd7c50cba-b765-4d0f-bc9e-9f76c92d9387',
  })
  @IsOptional()
  @IsUUID()
  generatedBy?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering report data (ISO 8601 format)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering report data (ISO 8601 format)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Offset for pagination (starting point)',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({
    description: 'Limit for pagination (max number of records)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number = 20;
}
