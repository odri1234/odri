import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../entities/notification-log.entity';
import { NotificationChannel, NotificationStatus } from '../enums/notification.enums';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly fromNumber: string;
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepo: Repository<NotificationLog>,
  ) {
    // Initialize from config
    this.apiUrl = this.configService.get<string>('notifications.whatsapp.apiUrl') || '';
    this.apiKey = this.configService.get<string>('notifications.whatsapp.apiKey') || '';
    this.fromNumber = this.configService.get<string>('notifications.whatsapp.fromNumber') || '';
    this.enabled = this.configService.get<boolean>('notifications.whatsapp.enabled', false);
  }

  /**
   * Send a WhatsApp message
   */
  async sendMessage(
    to: string,
    message: string,
    options: {
      templateName?: string;
      templateParams?: Record<string, string>;
      mediaUrl?: string;
      mediaType?: 'image' | 'document' | 'audio' | 'video';
      ispId?: string;
      userId?: string;
      clientId?: string;
      referenceId?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.warn('WhatsApp service is disabled. Message not sent.');
      return { success: false, error: 'WhatsApp service is disabled' };
    }

    try {
      // Format phone number (remove any non-numeric characters except +)
      const formattedNumber = to.replace(/[^\d+]/g, '');
      
      // Prepare the payload based on whether we're using a template or direct message
      let payload: any;
      
      if (options.templateName) {
        // Template-based message
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'template',
          template: {
            name: options.templateName,
            language: {
              code: 'en',
            },
            components: [],
          },
        };
        
        // Add template parameters if provided
        if (options.templateParams && Object.keys(options.templateParams).length > 0) {
          const parameters = Object.entries(options.templateParams).map(([_, value]) => ({
            type: 'text',
            text: value,
          }));
          
          payload.template.components.push({
            type: 'body',
            parameters,
          });
        }
      } else {
        // Direct text message
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'text',
          text: {
            body: message,
          },
        };
        
        // Add media if provided
        if (options.mediaUrl && options.mediaType) {
          payload.type = options.mediaType;
          payload[options.mediaType] = {
            link: options.mediaUrl,
            caption: message,
          };
          delete payload.text;
        }
      }

      // Make API request
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }),
      );

      // Log the successful message
      const log = new NotificationLog();
      log.channel = NotificationChannel.WHATSAPP;
      log.message = message;
      log.recipients = [formattedNumber];
      log.status = NotificationStatus.SENT;
      log.success = true;
      log.sentAt = new Date();
      
      await this.notificationLogRepo.save(log);

      this.logger.log(`WhatsApp message sent to ${formattedNumber}`);
      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
      };
    } catch (error: unknown) {
      // Log the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send WhatsApp message: ${errorMessage}`, errorStack);
      
      // Save the failed attempt
      const log = new NotificationLog();
      log.channel = NotificationChannel.WHATSAPP;
      log.message = message;
      log.recipients = [to];
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
   * Send a voucher code via WhatsApp
   */
  async sendVoucherCode(
    to: string,
    voucherCode: string,
    expiryDate: Date,
    options: {
      ispName?: string;
      amount?: number;
      currency?: string;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    } = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const templateParams = {
      1: voucherCode,
      2: expiryDate.toLocaleString(),
      3: options.amount ? `${options.amount} ${options.currency || 'KES'}` : 'N/A',
      4: options.ispName || 'Your ISP',
    };

    return this.sendMessage(to, '', {
      templateName: 'voucher_code',
      templateParams,
      ispId: options.ispId,
      clientId: options.clientId,
      referenceId: options.referenceId,
    });
  }

  /**
   * Send a payment confirmation via WhatsApp
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
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const templateParams = {
      1: `${options.amount} ${options.currency || 'KES'}`,
      2: options.transactionId,
      3: options.date.toLocaleString(),
      4: options.ispName || 'Your ISP',
    };

    return this.sendMessage(to, '', {
      templateName: 'payment_confirmation',
      templateParams,
      ispId: options.ispId,
      clientId: options.clientId,
      referenceId: options.referenceId,
    });
  }

  /**
   * Send an expiry reminder via WhatsApp
   */
  async sendExpiryReminder(
    to: string,
    options: {
      expiryDate: Date;
      packageName: string;
      remainingData?: string;
      ispName?: string;
      ispId?: string;
      clientId?: string;
      referenceId?: string;
    },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const templateParams = {
      1: options.packageName,
      2: options.expiryDate.toLocaleString(),
      3: options.remainingData || 'N/A',
      4: options.ispName || 'Your ISP',
    };

    return this.sendMessage(to, '', {
      templateName: 'expiry_reminder',
      templateParams,
      ispId: options.ispId,
      clientId: options.clientId,
      referenceId: options.referenceId,
    });
  }

  /**
   * Send a system alert to admin via WhatsApp
   */
  async sendSystemAlert(
    to: string,
    options: {
      alertType: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp?: Date;
      ispId?: string;
      referenceId?: string;
    },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const templateParams = {
      1: options.alertType.toUpperCase(),
      2: options.message,
      3: options.severity.toUpperCase(),
      4: (options.timestamp || new Date()).toLocaleString(),
    };

    return this.sendMessage(to, '', {
      templateName: 'system_alert',
      templateParams,
      ispId: options.ispId,
      referenceId: options.referenceId,
    });
  }
}