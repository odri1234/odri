import { IsString, IsOptional, IsEnum } from 'class-validator';

// Import the shared NotificationChannel enum
import { NotificationChannel } from '../enums/notification.enums';

export class NotificationTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;
}
