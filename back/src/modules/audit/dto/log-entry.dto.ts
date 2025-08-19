import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LogAction } from '../enums/log-action.enum'; // ✅ Correct shared import

export class LogEntryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the user performing the action',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'admin',
    description: 'Username of the user performing the action',
  })
  @IsString()
  username: string;

  @ApiProperty({
    enum: LogAction,
    example: LogAction.LOGIN,
    description: 'Action type of the log entry',
  })
  @IsEnum(LogAction)
  action: LogAction;

  @ApiProperty({
    example: 'User logged into the system',
    description: 'Description of the log entry',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '/api/auth/login',
    required: false,
    description: 'API route involved in the action',
  })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiProperty({
    example: '192.168.1.10',
    required: false,
    description: 'IP address from where the action was performed',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    required: false,
    description: 'User agent string of the client',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    example: '2025-07-19T12:34:56Z',
    description: 'Timestamp of when the log entry was created',
  })
  @IsDate()
  timestamp: Date;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique identifier for the log entry',
  })
  @IsUUID()
  id: string;
}
