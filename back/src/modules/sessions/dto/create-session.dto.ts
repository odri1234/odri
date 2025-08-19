// sessions/dto/create-session.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Device information (e.g. browser or device name)' })
  @IsString()
  @IsNotEmpty()
  deviceInfo!: string;

  @ApiPropertyOptional({ description: 'IP address of the device' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session expiration date in ISO format' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
