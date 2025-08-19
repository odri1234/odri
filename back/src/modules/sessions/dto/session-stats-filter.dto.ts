// sessions/dto/session-stats-filter.dto.ts
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SessionStatsFilterDto {
  @ApiPropertyOptional({ description: 'Month (1-12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ description: 'Year (e.g., 2025)' })
  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;
}
