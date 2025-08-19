import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AlertType {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  DISK = 'DISK',
  NETWORK = 'NETWORK',
  PING = 'PING',
  CUSTOM = 'CUSTOM',
  SYSTEM = 'SYSTEM',
}

export class AlertDto {
  @ApiProperty({
    example: 'High CPU Usage',
    description: 'Name of the alert',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'CPU usage exceeded 90%',
    description: 'Detailed message for the alert',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({
    enum: AlertType,
    example: AlertType.CPU,
    description: 'Type of alert',
  })
  @IsEnum(AlertType)
  type!: AlertType;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'Target IP or host being monitored',
    required: false,
  })
  @IsOptional()
  @IsString()
  target?: string;

  // Optional severity field if applicable in your Alert entity
  @ApiProperty({
    example: 'HIGH',
    description: 'Severity level of the alert',
    required: false,
  })
  @IsOptional()
  @IsString()
  severity?: string;
}
