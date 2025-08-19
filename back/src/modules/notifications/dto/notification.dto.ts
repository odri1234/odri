import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsNumber, 
  IsObject 
} from 'class-validator';

import { NotificationChannel, NotificationPriority } from '../enums/notification.enums';  // Correct import path

export class RecipientDto {
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class BulkNotificationDto {
  @IsArray()
  @IsString({ each: true })
  recipients!: string[];  // Array of recipient emails as strings

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsOptional()
  @IsNumber()
  templateId?: number;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  retries?: number;
}
