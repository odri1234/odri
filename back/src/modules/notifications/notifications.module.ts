import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

// Controllers
import { NotificationsController } from './notifications.controller';

// Services
import { NotificationsService } from './notifications.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { TelegramService } from './channels/telegram.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { PushService } from './channels/push.service';
import { InAppService } from './channels/in-app.service';

// Entities
import { Notification } from './entities/notification.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationTemplate } from './entities/notification-template.entity';

// Queues for async processing
import { NotificationProcessor } from './queues/notification.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationLog,
      NotificationTemplate,
    ]),
    ConfigModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
    BullModule.registerQueue({
      name: 'vouchers',
    }),
    BullModule.registerQueue({
      name: 'payments',
    }),
    BullModule.registerQueue({
      name: 'alerts',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    TelegramService,
    WhatsAppService,
    PushService,
    InAppService,
    NotificationProcessor,
  ],
  exports: [
    NotificationsService,
    EmailService,       // Email notifications
    SmsService,         // SMS notifications
    TelegramService,    // Telegram bot notifications
    WhatsAppService,    // WhatsApp notifications
    PushService,        // Push notifications
    InAppService,       // In-app notifications
  ],
})
export class NotificationsModule {}
