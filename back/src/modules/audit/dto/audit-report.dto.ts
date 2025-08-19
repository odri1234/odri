import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AuditReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
}

export class AuditReportDto {
  @ApiPropertyOptional({ description: 'User ID to filter logs for a specific user' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Username to filter logs' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Start date for the report range (ISO string)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date for the report range (ISO string)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    enum: AuditReportFormat,
    default: AuditReportFormat.PDF,
    description: 'Format of the exported report',
  })
  @IsOptional()
  @IsEnum(AuditReportFormat, {
    message: `Format must be one of: pdf, csv, excel, json`,
  })
  format: AuditReportFormat = AuditReportFormat.PDF;

  @ApiPropertyOptional({ description: 'Whether to include system logs' })
  @IsOptional()
  @IsBoolean()
  includeSystemLogs?: boolean;

  @ApiPropertyOptional({ description: 'Whether to include login logs' })
  @IsOptional()
  @IsBoolean()
  includeLoginLogs?: boolean;

  @ApiPropertyOptional({ description: 'Who triggered the report (username or system)' })
  @IsOptional()
  @IsString()
  generatedBy?: string;
}
