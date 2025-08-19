import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AnomalyType, AnomalySeverity } from '../constants/anomaly.constants'; // ✅ Import enums

export class AnomalyAlertDto {
  @ApiProperty({
    enum: AnomalyType,
    example: AnomalyType.UNUSUAL_USAGE,
    description: 'Type of anomaly detected',
  })
  @IsEnum(AnomalyType)
  @IsNotEmpty()
  type: AnomalyType;

  @ApiProperty({
    example: 'Session exceeded average usage by 3x',
    description: 'Detailed description of the anomaly',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '41d1dcb2-ec91-4c49-9d2d-3de0f8771a65',
    description: 'Optional related session ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    example: '9fae3e91-1840-451f-b727-40851d7e059e',
    description: 'Optional ID of the user or device that triggered the anomaly',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  actorId?: string;

  @ApiProperty({
    enum: AnomalySeverity,
    default: AnomalySeverity.MEDIUM,
    description: 'Severity level of the anomaly',
    required: false,
  })
  @IsEnum(AnomalySeverity)
  @IsOptional()
  severity?: AnomalySeverity;

  @ApiProperty({
    example: '2025-07-19T09:00:00.000Z',
    description: 'Timestamp when the anomaly was detected',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  detectedAt?: Date;
}
