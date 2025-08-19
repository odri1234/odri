// src/modules/analytics/dto/revenue-summary.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodDto } from './period.dto';  // Import the PeriodDto

export class RevenueSummaryDto {
  @ApiProperty({ description: 'Total revenue generated in the selected period', example: 150000.75 })
  @IsNumber()
  totalRevenue: number;

  @ApiProperty({ description: 'Currency of the revenue', example: 'KES' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Number of transactions processed', example: 4321 })
  @IsNumber()
  transactionCount: number;

  @ApiProperty({ description: 'Average revenue per user (ARPU)', example: 345.60 })
  @IsNumber()
  averageRevenuePerUser: number;

  @ApiProperty({ description: 'Revenue growth rate compared to previous period (%)', example: 12.5 })
  @IsNumber()
  growthRate: number;

  @ApiProperty({ description: 'Daily average revenue in the selected period', example: 5000.25 })
  @IsNumber()
  dailyAverageRevenue: number;

  @ApiProperty({
    description: 'Period covered by the summary',
    type: PeriodDto,
  })
  @ValidateNested()
  @Type(() => PeriodDto)
  period: PeriodDto;
}
