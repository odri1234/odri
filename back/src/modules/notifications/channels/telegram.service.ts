import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { NotificationLog } from '../entities/notification-log.entity';
import { NotificationChannel, NotificationStatus } from '../enums/notification.enums';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly apiToken: string;
  private readonly apiUrl: string;
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepo: Repository<NotificationLog>,
  ) {
    this.apiToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
    this.apiUrl = `https://api.telegram.org/bot${this.apiToken}`;
    this.enabled = !!this.apiToken;

    if (!this.enabled) {
      this.logger.warn('Telegram service is disabled. No API token provided.');
    } else {
      this.logger.log('Telegram service initialized');
    }
  }

  /**
   * Send a simple text message
   */
  async sendMessage(
    chatId: string,
    message: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Telegram service is not enabled',
      };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: options.parseMode,
        disable_notification: options.disableNotification,
      });

      if (response.data.ok) {
        // Save successful notification
        const log = new NotificationLog();
        log.channel = NotificationChannel.TELEGRAM;
        log.message = message;
        log.recipients = [chatId];
        log.status = NotificationStatus.SENT;
        log.success = true;
        log.ispId = options.ispId;
        log.clientId = options.clientId;
        log.referenceId = options.referenceId;
        
        await this.notificationLogRepo.save(log);

        return {
          success: true,
          messageId: response.data.result.message_id,
        };
      } else {
        throw new Error(response.data.description || 'Unknown Telegram API error');
      }
    } catch (error: unknown) {
      // Log the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send Telegram message: ${errorMessage}`, errorStack);
      
      // Save the failed attempt
      const log = new NotificationLog();
      log.channel = NotificationChannel.TELEGRAM;
      log.message = message;
      log.recipients = [chatId];
      log.status = NotificationStatus.FAILED;
      log.success = false;
      log.errorMessage = errorMessage;
      
      await this.notificationLogRepo.save(log);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send a message with a photo
   */
  async sendPhoto(
    to: string,
    photoUrl: string,
    caption?: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Telegram service is not enabled',
      };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/sendPhoto`, {
        chat_id: to,
        photo: photoUrl,
        caption: caption,
        parse_mode: options.parseMode,
        disable_notification: options.disableNotification,
      });

      if (response.data.ok) {
        // Save successful notification
        const log = new NotificationLog();
        log.channel = NotificationChannel.TELEGRAM;
        log.message = caption || 'Photo message';
        log.recipients = [to];
        log.status = NotificationStatus.SENT;
        log.success = true;
        log.ispId = options.ispId;
        log.clientId = options.clientId;
        log.referenceId = options.referenceId;
        log.metadata = { photoUrl };
        
        await this.notificationLogRepo.save(log);

        return {
          success: true,
          messageId: response.data.result.message_id,
        };
      } else {
        throw new Error(response.data.description || 'Unknown Telegram API error');
      }
    } catch (error: unknown) {
      // Log the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send Telegram photo: ${errorMessage}`, errorStack);
      
      // Save the failed attempt
      const log = new NotificationLog();
      log.channel = NotificationChannel.TELEGRAM;
      log.message = caption || 'Photo message';
      log.recipients = [to];
      log.status = NotificationStatus.FAILED;
      log.success = false;
      log.errorMessage = errorMessage;
      log.metadata = { photoUrl };
      
      await this.notificationLogRepo.save(log);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send a document (file)
   */
  async sendDocument(
    to: string,
    documentUrl: string,
    caption?: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Telegram service is not enabled',
      };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/sendDocument`, {
        chat_id: to,
        document: documentUrl,
        caption: caption,
        parse_mode: options.parseMode,
        disable_notification: options.disableNotification,
      });

      if (response.data.ok) {
        // Save successful notification
        const log = new NotificationLog();
        log.channel = NotificationChannel.TELEGRAM;
        log.message = caption || 'Document message';
        log.recipients = [to];
        log.status = NotificationStatus.SENT;
        log.success = true;
        log.ispId = options.ispId;
        log.clientId = options.clientId;
        log.referenceId = options.referenceId;
        log.metadata = { documentUrl };
        
        await this.notificationLogRepo.save(log);

        return {
          success: true,
          messageId: response.data.result.message_id,
        };
      } else {
        throw new Error(response.data.description || 'Unknown Telegram API error');
      }
    } catch (error: unknown) {
      // Log the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send Telegram document: ${errorMessage}`, errorStack);
      
      // Save the failed attempt
      const log = new NotificationLog();
      log.channel = NotificationChannel.TELEGRAM;
      log.message = caption || 'Document message';
      log.recipients = [to];
      log.status = NotificationStatus.FAILED;
      log.success = false;
      log.errorMessage = errorMessage;
      log.metadata = { documentUrl };
      
      await this.notificationLogRepo.save(log);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send a payment receipt
   */
  async sendPaymentReceipt(
    to: string,
    options: {
      amount: number;
      currency?: string;
      transactionId: string;
      date: Date;
      ispName?: string;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    },
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const message = `🧾 *PAYMENT RECEIPT*\n\n*Amount:* ${options.amount} ${options.currency || 'KES'}\n*Transaction ID:* \`${options.transactionId}\`\n*Date:* ${options.date.toLocaleString()}\n\n_Thank you for your payment to ${options.ispName || 'Your ISP'}_`;

    return this.sendMessage(to, message, {
      parseMode: 'Markdown',
      ispId: options.ispId,
      clientId: options.clientId,
      referenceId: options.referenceId,
    });
  }

  /**
   * Send a payment confirmation
   */
  async sendPaymentConfirmation(
    to: string,
    options: {
      amount: number;
      currency?: string;
      transactionId: string;
      date: Date;
      ispName?: string;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    },
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const message = `✅ *PAYMENT CONFIRMED*\n\n*Amount:* ${options.amount} ${options.currency || 'KES'}\n*Transaction ID:* \`${options.transactionId}\`\n*Date:* ${options.date.toLocaleString()}\n\n_Thank you for your payment to ${options.ispName || 'Your ISP'}_`;

    return this.sendMessage(to, message, {
      parseMode: 'Markdown',
      ispId: options.ispId,
      clientId: options.clientId,
      referenceId: options.referenceId,
    });
  }

  /**
   * Send a telegram message directly
   */
  async sendTelegramMessage(chatId: string, message: string) {
    // TODO: Implement telegram message logic
    return { success: true, messageId: Date.now() };
  }
}