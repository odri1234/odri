import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MetricType {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  DISK = 'DISK',
  NETWORK = 'NETWORK',
  TEMPERATURE = 'TEMPERATURE',
}

export class MetricDto {
  @ApiProperty({
    example: '192.168.88.1',
    description: 'Device IP address',
  })
  @IsString()
  ipAddress!: string;

  @ApiProperty({
    example: 'Router-A',
    description: 'Device name or label',
  })
  @IsString()
  deviceName!: string;

  @ApiProperty({
    enum: MetricType,
    example: MetricType.CPU,
    description: 'Type of metric',
  })
  @IsEnum(MetricType)
  metricType!: MetricType;

  @ApiProperty({
    example: 85,
    description: 'Metric value (e.g., percentage or absolute number)',
  })
  @IsNumber()
  value!: number;

  @ApiProperty({
    example: 'Percentage of CPU usage',
    description: 'Optional metric description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2025-07-10T17:30:00Z',
    description: 'Timestamp of the metric',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
