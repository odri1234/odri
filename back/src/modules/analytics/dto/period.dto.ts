// src/modules/analytics/dto/period.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PeriodDto {
  @ApiProperty({ description: 'Start date of the period', example: '2025-01-01T00:00:00.000Z' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'End date of the period', example: '2025-01-31T00:00:00.000Z' })
  @IsString()
  endDate: string;
}
