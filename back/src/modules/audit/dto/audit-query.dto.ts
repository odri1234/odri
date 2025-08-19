import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsUUID, 
  IsDateString, 
  IsInt, 
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LogAction } from '../enums/log-action.enum'; // ✅ Use shared enum

export class AuditQueryDto {
  @ApiPropertyOptional({ description: 'UUID of the user performing the action' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Type of action performed', enum: LogAction })
  @IsOptional()
  @IsEnum(LogAction, {
    message: `Action must be one of: ${Object.values(LogAction).join(', ')}`,
  })
  action?: LogAction;

  @ApiPropertyOptional({ description: 'Start date filter (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO 8601 format)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit number of records per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Keyword to search in audit messages' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Audit log level (e.g., INFO, WARN, ERROR)' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Audit log message content' })
  @IsOptional()
  @IsString()
  message?: string;
}
