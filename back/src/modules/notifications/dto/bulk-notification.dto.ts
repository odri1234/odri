import {
  IsArray,
  IsOptional,
  IsString,
  IsEnum,
  IsObject,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';  // <-- import Type here

import {
  NotificationChannel,
  NotificationPriority,
} from '../enums/notification.enums';

export class BulkNotificationDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  recipients!: string[];

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()  // templateId as UUID string
  templateId?: string;

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)          // <-- add this line to transform string to number
  @IsNumber({}, { message: 'retries must be a number' })  // <-- fix with options
  retries?: number;
}
