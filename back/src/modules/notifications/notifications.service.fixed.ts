import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { TelegramService } from './channels/telegram.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { PushService } from './channels/push.service';
import { InAppService } from './channels/in-app.service';
import { 
  NotificationChannel, 
  NotificationPriority, 
  NotificationStatus 
} from './enums/notification.enums';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly whatsAppService: WhatsAppService,
    private readonly pushService: PushService,
    private readonly inAppService: InAppService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectQueue('vouchers') private readonly vouchersQueue: Queue,
    @InjectQueue('payments') private readonly paymentsQueue: Queue,
    @InjectQueue('alerts') private readonly alertsQueue: Queue,
  ) {}

  /**
   * Send a notification immediately through specified channel
   */
  async sendNotification(
    channel: NotificationChannel | NotificationChannel[],
    to: string,
    message: string,
    options: {
      subject?: string;
      templateName?: string;
      templateData?: Record<string, any>;
      attachments?: any[];
      ispId?: string;
      clientId?: string;
      userId?: string;
      referenceId?: string;
      [key: string]: any;
    } = {},
  ): Promise<boolean> {
    try {
      const channels = Array.isArray(channel) ? channel : [channel];
      const subject = options.subject || 'Notification';
      
      // If ALL is specified, send to all available channels
      if (channels.includes(NotificationChannel.ALL)) {
        const allChannels = Object.values(NotificationChannel).filter(
          (ch) => ch !== NotificationChannel.ALL,
        );
        
        const results = await Promise.all(
          allChannels.map((ch) => 
            this.sendToChannel(ch, to, subject, message, options)
          )
        );
        
        return results.some(Boolean);
      }
      
      // Otherwise, send to each specified channel
      const results = await Promise.all(
        channels.map((ch) => 
          this.sendToChannel(ch, to, subject, message, options)
        )
      );
      
      return results.some(Boolean);
    } catch (error: any) {
      this.logger.error('❌ Notification dispatch failed', error?.stack || error);
      return false;
    }
  }

  private async sendToChannel(
    channel: NotificationChannel,
    to: string,
    subject: string,
    message: string,
    options: Record<string, any> = {},
  ): Promise<boolean> {
    try {
      switch (channel) {
        case NotificationChannel.EMAIL:
          await this.emailService.sendEmail(to, subject, message);
          return true;
        case NotificationChannel.SMS:
          await this.smsService.sendSms(to, message);
          return true;
        case NotificationChannel.TELEGRAM:
          const telegramResult = await this.telegramService.sendMessage(to, message, options);
          return telegramResult.success;
        case NotificationChannel.WHATSAPP:
          const whatsappResult = await this.whatsAppService.sendMessage(to, message, options);
          return whatsappResult.success;
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send to channel ${channel}: ${errorMessage}`);
      return false;
    }
  }
  
  /**
   * Queue a notification for asynchronous processing
   */
  async queueNotification(
    channel: NotificationChannel,
    to: string,
    message: string,
    options: {
      subject?: string;
      templateName?: string;
      templateData?: Record<string, any>;
      attachments?: any[];
      priority?: NotificationPriority;
      delay?: number;
      ispId?: string;
      clientId?: string;
      userId?: string;
      referenceId?: string;
      [key: string]: any;
    } = {},
  ): Promise<{ jobId: string | number }> {
    const jobData = {
      channel: channel,
      to,
      subject: options.subject,
      message,
      templateName: options.templateName,
      templateData: options.templateData,
      attachments: options.attachments,
      options: {
        ispId: options.ispId,
        clientId: options.clientId,
        userId: options.userId,
        referenceId: options.referenceId,
        ...options,
      },
    };
    
    const job = await this.notificationsQueue.add('send', jobData, {
      priority: this.getPriorityValue(options.priority || NotificationPriority.NORMAL),
      delay: options.delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    
    this.logger.log(`Queued notification job ${job.id} to ${to} via ${channel}`);
    
    return { jobId: job.id };
  }
  
  /**
   * Queue a voucher notification
   */
  async queueVoucherNotification(
    channel: NotificationChannel,
    to: string,
    voucherId: string,
    options: {
      subject?: string;
      templateName?: string;
      templateData?: Record<string, any>;
      priority?: NotificationPriority;
      delay?: number;
      ispId?: string;
      clientId?: string;
      userId?: string;
      [key: string]: any;
    } = {},
  ): Promise<{ jobId: string | number }> {
    const jobData = {
      channel: channel,
      to,
      voucherId,
      subject: options.subject || 'Your Voucher',
      templateName: options.templateName,
      templateData: options.templateData,
      options: {
        ispId: options.ispId,
        clientId: options.clientId,
        userId: options.userId,
        ...options,
      },
    };
    
    const job = await this.vouchersQueue.add('notify', jobData, {
      priority: this.getPriorityValue(options.priority || NotificationPriority.HIGH),
      delay: options.delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    
    this.logger.log(`Queued voucher notification job ${job.id} to ${to} via ${channel}`);
    
    return { jobId: job.id };
  }
  
  /**
   * Queue a payment notification
   */
  async queuePaymentNotification(
    channel: NotificationChannel,
    to: string,
    paymentId: string,
    options: {
      subject?: string;
      templateName?: string;
      templateData?: Record<string, any>;
      priority?: NotificationPriority;
      delay?: number;
      ispId?: string;
      clientId?: string;
      userId?: string;
      [key: string]: any;
    } = {},
  ): Promise<{ jobId: string | number }> {
    const jobData = {
      channel: channel,
      to,
      paymentId,
      subject: options.subject || 'Payment Notification',
      templateName: options.templateName,
      templateData: options.templateData,
      options: {
        ispId: options.ispId,
        clientId: options.clientId,
        userId: options.userId,
        ...options,
      },
    };
    
    const job = await this.paymentsQueue.add('notify', jobData, {
      priority: this.getPriorityValue(options.priority || NotificationPriority.HIGH),
      delay: options.delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    
    this.logger.log(`Queued payment notification job ${job.id} to ${to} via ${channel}`);
    
    return { jobId: job.id };
  }
  
  /**
   * Queue an alert notification
   */
  async queueAlertNotification(
    channel: NotificationChannel,
    to: string,
    alertId: string,
    options: {
      subject?: string;
      templateName?: string;
      templateData?: Record<string, any>;
      priority?: NotificationPriority;
      delay?: number;
      ispId?: string;
      severity?: string;
      [key: string]: any;
    } = {},
  ): Promise<{ jobId: string | number }> {
    const jobData = {
      channel: channel,
      to,
      alertId,
      subject: options.subject || 'System Alert',
      templateName: options.templateName,
      templateData: options.templateData,
      options: {
        ispId: options.ispId,
        severity: options.severity || 'info',
        ...options,
      },
    };
    
    // Determine priority based on severity
    let priority = NotificationPriority.NORMAL;
    if (options.severity === 'critical') {
      priority = NotificationPriority.CRITICAL;
    } else if (options.severity === 'high') {
      priority = NotificationPriority.HIGH;
    } else if (options.severity === 'low') {
      priority = NotificationPriority.LOW;
    }
    
    const job = await this.alertsQueue.add('notify', jobData, {
      priority: this.getPriorityValue(options.priority || priority),
      delay: options.delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    
    this.logger.log(`Queued alert notification job ${job.id} to ${to} via ${channel}`);
    
    return { jobId: job.id };
  }
  
  /**
   * Convert priority enum to Bull priority value (lower is higher priority)
   */
  private getPriorityValue(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 1;
      case NotificationPriority.HIGH:
        return 2;
      case NotificationPriority.NORMAL:
        return 3;
      case NotificationPriority.LOW:
        return 4;
      default:
        return 3;
    }
  }
}