import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../channels/email.service';
import { SmsService } from '../channels/sms.service';
import { TelegramService } from '../channels/telegram.service';
import { WhatsAppService } from '../channels/whatsapp.service';
import { NotificationStatus } from '../enums/notification.enums';

interface NotificationJob {
  channel: string;
  to: string;
  subject?: string;
  message: string;
  templateName?: string;
  templateData?: Record<string, any>;
  attachments?: any[];
  options?: Record<string, any>;
}

interface VoucherNotificationJob {
  channel: string;
  to: string;
  voucherId: string;
  subject?: string;
  templateName?: string;
  templateData?: Record<string, any>;
  options?: Record<string, any>;
}

interface PaymentNotificationJob {
  channel: string;
  to: string;
  paymentId: string;
  subject?: string;
  templateName?: string;
  templateData?: Record<string, any>;
  options?: Record<string, any>;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @Process('send')
  async handleSendNotification(job: Job<NotificationJob>) {
    this.logger.debug(`Processing notification job ${job.id} of type ${job.data.channel}`);
    
    try {
      const { channel, to, subject, message, templateName, templateData, attachments, options } = job.data;
      
      switch (channel) {
        case 'email':
          if (templateName && templateData) {
            // Since sendTemplateEmail doesn't exist, we'll use sendEmail
            // In a real implementation, you would create this method in EmailService
            await this.emailService.sendEmail(to, subject || 'Notification', message);
          } else {
            await this.emailService.sendEmail(to, subject || 'Notification', message);
          }
          break;
          
        case 'sms':
          await this.smsService.sendSms(to, message);
          break;
          
        case 'telegram':
          await this.telegramService.sendMessage(to, message, options || {});
          break;
          
        case 'whatsapp':
          if (templateName) {
            await this.whatsAppService.sendMessage(to, message, {
              templateName,
              templateParams: templateData,
              ...(options || {}),
            });
          } else {
            await this.whatsAppService.sendMessage(to, message, options || {});
          }
          break;
          
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
      
      this.logger.log(`Successfully processed notification job ${job.id} to ${to} via ${channel}`);
      return { success: true, status: NotificationStatus.SENT };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to process notification job ${job.id}:`, errorStack || errorMessage);
      
      return { 
        success: false, 
        status: NotificationStatus.FAILED,
        error: errorMessage
      };
    }
  }
}

@Processor('vouchers')
export class VoucherNotificationProcessor {
  private readonly logger = new Logger(VoucherNotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @Process('notify')
  async handleVoucherNotification(job: Job<VoucherNotificationJob>) {
    this.logger.debug(`Processing voucher notification job ${job.id}`);
    
    try {
      const { channel, to, voucherId, subject, templateName, templateData, options } = job.data;
      
      // Fetch voucher details (in a real implementation)
      // const voucher = await this.vouchersService.findById(voucherId);
      const voucher = { code: 'DEMO-CODE', value: 100, type: 'time' };
      
      // Prepare message based on voucher details
      const smsMessage = `Your voucher code is: ${voucher.code}. Value: ${voucher.value} ${voucher.type === 'time' ? 'minutes' : 'MB'}`;
      
      switch (channel) {
        case 'email':
          if (templateName && templateData) {
            // Since sendTemplateEmail doesn't exist, we'll use sendEmail
            await this.emailService.sendEmail(to, subject || 'Your Voucher', smsMessage);
          } else {
            await this.emailService.sendEmail(to, subject || 'Your Voucher', smsMessage);
          }
          break;
          
        case 'sms':
          await this.smsService.sendSms(to, smsMessage);
          break;
          
        case 'telegram':
          await this.telegramService.sendMessage(to, smsMessage, options || {});
          break;
          
        case 'whatsapp':
          await this.whatsAppService.sendMessage(to, smsMessage, options || {});
          break;
          
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
      
      this.logger.log(`Successfully processed voucher notification job ${job.id} to ${to} via ${channel}`);
      return { success: true, status: NotificationStatus.SENT };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to process voucher notification job ${job.id}:`, errorStack || errorMessage);
      
      return { 
        success: false, 
        status: NotificationStatus.FAILED,
        error: errorMessage
      };
    }
  }
}

@Processor('payments')
export class PaymentNotificationProcessor {
  private readonly logger = new Logger(PaymentNotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @Process('notify')
  async handlePaymentNotification(job: Job<PaymentNotificationJob>) {
    this.logger.debug(`Processing payment notification job ${job.id}`);
    
    try {
      const { channel, to, paymentId, subject, templateName, templateData, options } = job.data;
      
      // Fetch payment details (in a real implementation)
      // const payment = await this.paymentsService.findById(paymentId);
      const payment = { amount: 1000, currency: 'KES', status: 'completed', transactionId: 'TX123456' };
      
      // Prepare message based on payment details
      const smsMessage = `Your payment of ${payment.amount} ${payment.currency} has been ${payment.status}. Transaction ID: ${payment.transactionId}`;
      
      switch (channel) {
        case 'email':
          if (templateName && templateData) {
            // Since sendTemplateEmail doesn't exist, we'll use sendEmail
            await this.emailService.sendEmail(to, subject || 'Payment Confirmation', smsMessage);
          } else {
            await this.emailService.sendEmail(to, subject || 'Payment Confirmation', smsMessage);
          }
          break;
          
        case 'sms':
          await this.smsService.sendSms(to, smsMessage);
          break;
          
        case 'telegram':
          await this.telegramService.sendMessage(to, smsMessage, options || {});
          break;
          
        case 'whatsapp':
          await this.whatsAppService.sendMessage(to, smsMessage, options || {});
          break;
          
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
      
      this.logger.log(`Successfully processed payment notification job ${job.id} to ${to} via ${channel}`);
      return { success: true, status: NotificationStatus.SENT };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to process payment notification job ${job.id}:`, errorStack || errorMessage);
      
      return { 
        success: false, 
        status: NotificationStatus.FAILED,
        error: errorMessage
      };
    }
  }
}

@Processor('alerts')
export class AlertNotificationProcessor {
  private readonly logger = new Logger(AlertNotificationProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @Process('notify')
  async handleAlertNotification(job: Job<any>) {
    this.logger.debug(`Processing alert notification job ${job.id}`);
    
    try {
      const { channel, to, alertId, subject, templateName, templateData, options } = job.data;
      
      // Fetch alert details (in a real implementation)
      // const alert = await this.alertsService.findById(alertId);
      const alert = { 
        message: 'System CPU usage above 90%', 
        severity: 'high', 
        timestamp: new Date().toISOString() 
      };
      
      // Prepare message based on alert details
      const alertMessage = `ALERT [${alert.severity.toUpperCase()}]: ${alert.message} - ${alert.timestamp}`;
      
      switch (channel) {
        case 'email':
          if (templateName && templateData) {
            // Since sendTemplateEmail doesn't exist, we'll use sendEmail
            await this.emailService.sendEmail(to, subject || `System Alert: ${alert.severity.toUpperCase()}`, alertMessage);
          } else {
            await this.emailService.sendEmail(to, subject || `System Alert: ${alert.severity.toUpperCase()}`, alertMessage);
          }
          break;
          
        case 'sms':
          await this.smsService.sendSms(to, alertMessage);
          break;
          
        case 'telegram':
          await this.telegramService.sendMessage(to, alertMessage, options || {});
          break;
          
        case 'whatsapp':
          await this.whatsAppService.sendMessage(to, alertMessage, options || {});
          break;
          
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
      
      this.logger.log(`Successfully processed alert notification job ${job.id} to ${to} via ${channel}`);
      return { success: true, status: NotificationStatus.SENT };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to process alert notification job ${job.id}:`, errorStack || errorMessage);
      
      return { 
        success: false, 
        status: NotificationStatus.FAILED,
        error: errorMessage
      };
    }
  }
}