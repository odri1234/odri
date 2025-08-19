// src/modules/analytics/dto/usage-summary.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodDto } from './period.dto';  // Import the PeriodDto

export class UsageSummaryDto {
  @ApiProperty({ description: 'Total data consumed in MB', example: 1048576 })
  @IsNumber()
  totalDataUsageMB: number;

  @ApiProperty({ description: 'Total number of active sessions during the period', example: 7689 })
  @IsNumber()
  sessionCount: number;

  @ApiProperty({ description: 'Average session duration in minutes', example: 45.3 })
  @IsNumber()
  averageSessionDuration: number;

  @ApiProperty({ description: 'Peak usage time of day', example: '18:00' })
  @IsString()
  peakUsageTime: string;

  @ApiProperty({ description: 'Average data usage per user (MB)', example: 235.7 })
  @IsNumber()
  averageUsagePerUserMB: number;

  @ApiProperty({
    description: 'Period covered by the summary',
    type: PeriodDto,
  })
  @ValidateNested()
  @Type(() => PeriodDto)
  period: PeriodDto;
}
