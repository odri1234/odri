import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { NotificationChannel, NotificationPriority } from '../enums/notification.enums';

export class SendNotificationDto {
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsArray()
  @IsString({ each: true })
  to!: string[];  // recipients

  @IsOptional()
  @IsString()
  templateId?: string;  // UUID as string

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsNumber({}, { message: 'Retries must be a number' })  // <-- fixed here
  retries?: number;
}
