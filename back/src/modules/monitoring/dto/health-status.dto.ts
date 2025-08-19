import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatusLevel {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  DOWN = 'DOWN',
}

export class HealthStatusDto {
  @ApiProperty({
    example: '192.168.88.1',
    description: 'IP address of the monitored device',
  })
  @IsString()
  ipAddress!: string;

  @ApiProperty({
    example: 'Router-ISP1',
    description: 'Device name or label',
  })
  @IsString()
  deviceName!: string;

  @ApiProperty({
    example: 75,
    description: 'CPU usage percentage',
  })
  @IsNumber()
  cpuUsage!: number;

  @ApiProperty({
    example: 65,
    description: 'Memory usage percentage',
  })
  @IsNumber()
  memoryUsage!: number;

  @ApiProperty({
    example: 90,
    description: 'Disk usage percentage',
  })
  @IsNumber()
  diskUsage!: number;

  @ApiProperty({
    enum: HealthStatusLevel,
    example: HealthStatusLevel.HEALTHY,
    description: 'Overall health status',
  })
  @IsEnum(HealthStatusLevel)
  healthLevel!: HealthStatusLevel; // ✅ renamed from `status` to avoid entity conflicts

  @ApiProperty({
    example: 'System operating normally',
    description: 'Optional health message',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: '2025-07-18T12:00:00Z',
    description: 'Timestamp of health check',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkedAt?: string; // Optional timestamp for better tracking
}
