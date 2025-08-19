import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../entities/notification-log.entity';
import { NotificationChannel, NotificationStatus } from '../enums/notification.enums';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepo: Repository<NotificationLog>,
  ) {
    // Check if push notifications are enabled in config
    this.enabled = this.configService.get<boolean>('PUSH_NOTIFICATIONS_ENABLED', false);

    if (!this.enabled) {
      this.logger.warn('Push notification service is disabled');
    } else {
      this.logger.log('Push notification service initialized');
    }
  }

  /**
   * Send a push notification
   */
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    options: {
      data?: Record<string, string>;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Push notification service is not enabled',
      };
    }

    try {
      // TODO: Implement actual push notification logic with a provider like Firebase
      // This is a placeholder implementation
      this.logger.log(`Sending push notification to ${deviceToken}: ${title}`);
      
      // Mock successful push notification
      const messageId = `push-${Date.now()}`;
      
      // Save successful notification
      const log = new NotificationLog();
      log.channel = NotificationChannel.PUSH;
      log.message = `${title}: ${body}`;
      log.recipients = [deviceToken];
      log.status = NotificationStatus.SENT;
      log.success = true;
      log.ispId = options.ispId;
      log.clientId = options.clientId;
      log.referenceId = options.referenceId;
      log.metadata = { data: options.data };
      
      await this.notificationLogRepo.save(log);

      return {
        success: true,
        messageId,
      };
    } catch (error: unknown) {
      // Log the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send push notification: ${errorMessage}`, errorStack);
      
      // Save the failed attempt
      const log = new NotificationLog();
      log.channel = NotificationChannel.PUSH;
      log.message = `${title}: ${body}`;
      log.recipients = [deviceToken];
      log.status = NotificationStatus.FAILED;
      log.success = false;
      log.errorMessage = errorMessage;
      log.metadata = { data: options.data };
      
      await this.notificationLogRepo.save(log);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}