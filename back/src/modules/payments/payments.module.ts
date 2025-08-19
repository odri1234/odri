// src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

// Entities
import { Payment } from './entities/payment.entity';
import { Transaction } from './entities/transaction.entity';
import { MpesaTransaction } from './entities/mpesa-transaction.entity';

// Repositories (if you have custom repositories, import them here)
// import { PaymentRepository } from './repositories/payment.repository'; // Optional

// External modules
import { NotificationsModule } from '../notifications/notifications.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Transaction,
      MpesaTransaction,
    ]),
    NotificationsModule, // 📩 Email, SMS, Telegram
    PdfModule,           // 🧾 PDF generation service
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService], // 👈 Export for other modules to use
})
export class PaymentsModule {}
