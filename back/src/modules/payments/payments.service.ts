// src/modules/payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';

import { Payment } from './entities/payment.entity';
import { Transaction } from './entities/transaction.entity';
import { MpesaTransaction, MpesaTransactionStatus } from './entities/mpesa-transaction.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { MpesaCallbackDto } from './mpesa/dto/callback.dto';

import { EmailService } from '../notifications/channels/email.service';
import { SmsService } from '../notifications/channels/sms.service';
import { TelegramService } from '../notifications/channels/telegram.service';
import { PdfService } from '../pdf/pdf.service';

interface MpesaCallbackBody {
  stkCallback?: {
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: {
      Item: Array<{
        Name: string;
        Value: any;
      }>;
    };
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(MpesaTransaction)
    private readonly mpesaTransactionRepository: Repository<MpesaTransaction>,

    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly pdfService: PdfService,
  ) {}

  // -------------------------------
  // Create & Update Payment
  // -------------------------------

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    if (data.status && !Object.values(PaymentStatus).includes(data.status)) {
      throw new BadRequestException('Invalid payment status');
    }

    const payment = this.paymentRepository.create(data);
    return this.paymentRepository.save(payment);
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with id ${id} not found`);
    return payment;
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    payment.status = status;
    return this.paymentRepository.save(payment);
  }

  async updatePaymentStatusByCheckoutId(checkoutRequestId: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { transactionId: checkoutRequestId } });

    if (!payment) {
      this.logger.warn(`⚠️ No payment found for CheckoutRequestID: ${checkoutRequestId}`);
      throw new NotFoundException(`No payment found for CheckoutRequestID: ${checkoutRequestId}`);
    }

    payment.status = status;
    return this.paymentRepository.save(payment);
  }

  async refundPayment(paymentId: string, reason: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    payment.refundReason = reason;
    payment.refundDate = new Date();
    payment.status = PaymentStatus.REFUNDED;

    return this.paymentRepository.save(payment);
  }

  // -------------------------------
  // M-Pesa Callback Handling
  // -------------------------------

  async logMpesaTransaction(mpesaData: Partial<MpesaTransaction>): Promise<MpesaTransaction> {
    const mpesaTransaction = this.mpesaTransactionRepository.create(mpesaData);
    return this.mpesaTransactionRepository.save(mpesaTransaction);
  }

  async handleMpesaCallback(callbackDto: MpesaCallbackDto): Promise<boolean> {
    this.logger.log('📥 Received M-Pesa callback');

    const stkCallback = (callbackDto.Body as MpesaCallbackBody)?.stkCallback;
    if (!stkCallback?.CheckoutRequestID) {
      throw new BadRequestException('Invalid callback payload');
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
    const status = ResultCode === 0 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

    const metadata = (name: string) =>
      CallbackMetadata?.Item?.find(item => item.Name === name)?.Value ?? '';

    const amount = metadata('Amount') || 0;
    const phoneNumber = metadata('PhoneNumber');
    const receiptNumber = metadata('MpesaReceiptNumber') || 'N/A';
    const accountReference = metadata('AccountReference');

    await this.logMpesaTransaction({
      transactionId: CheckoutRequestID,
      amount,
      phoneNumber,
      transactionDesc: ResultDesc,
      status: ResultCode === 0 ? MpesaTransactionStatus.SUCCESS : MpesaTransactionStatus.FAILED,
      createdAt: new Date(),
      updatedAt: new Date(),
      receiptNumber,
      accountReference,
    });

    const payment = await this.updatePaymentStatusByCheckoutId(CheckoutRequestID, status);

    const user = {
      id: payment.userId,
      email: 'user@example.com', // Replace with real user lookup
      phoneNumber,
      telegramId: '',
      name: 'Customer',
    };

    const receiptPdf = await this.pdfService.generateReceipt(payment);

    await this.emailService.sendEmail(
      user.email,
      'Your Payment Receipt from ODRI WiFi',
      `
        <p>Hi ${user.name},</p>
        <p>Thank you for your payment of KES ${amount}.</p>
        <p>Receipt Number: ${receiptNumber}</p>
        <p>Transaction ID: ${CheckoutRequestID}</p>
      `
    );

    if (user.phoneNumber) {
      await this.smsService.sendSms(
        user.phoneNumber,
        `Hi ${user.name}, your payment of KES ${amount} was successful. Receipt: ${receiptNumber}. Thank you!`
      );
    }

    // Send Telegram notification if user has a Telegram ID
    if (user.telegramId) {
      await this.telegramService.sendMessage(
        user.telegramId,
        `Payment received: KES ${amount} from ${user.name}. Receipt: ${receiptNumber}.`
      );
    }

    this.logger.log(`✅ M-Pesa transaction processed for CheckoutRequestID: ${CheckoutRequestID}`);
    return true;
  }

  // -------------------------------
  // Transactions
  // -------------------------------

  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(data);
    return this.transactionRepository.save(transaction);
  }

  async getTransactionsByPaymentId(paymentId: string): Promise<Transaction[]> {
    const payment = await this.getPaymentById(paymentId);
    return this.transactionRepository.find({
      where: { externalTransactionId: payment.transactionId },
    });
  }

  // -------------------------------
  // Public Access
  // -------------------------------

  async getPaymentStatus(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { transactionId } });
    if (!payment) throw new NotFoundException(`No payment found for transaction ID: ${transactionId}`);
    return payment;
  }

  async getPaymentHistory(userId: string, status?: string, page = 1, limit = 20): Promise<Payment[]> {
    const query = this.paymentRepository.createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId });

    if (status) query.andWhere('payment.status = :status', { status });

    return query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  // -------------------------------
  // Admin Analytics
  // -------------------------------

  async getAdminAnalytics(userRole: string): Promise<any> {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    const [total, completed, failed, refunded] = await Promise.all([
      this.paymentRepository.count(),
      this.paymentRepository.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.paymentRepository.count({ where: { status: PaymentStatus.FAILED } }),
      this.paymentRepository.count({ where: { status: PaymentStatus.REFUNDED } }),
    ]);

    return { total, completed, failed, refunded };
  }

  // -------------------------------
  // Webhook Retry Logic
  // -------------------------------

  async retryWebhook(paymentId: string): Promise<boolean> {
    const payment = await this.getPaymentById(paymentId);

    if (!payment.webhookUrl) {
      this.logger.warn(`❗ No webhook URL configured for payment ${paymentId}`);
      return false;
    }

    try {
      this.logger.log(`📤 Retrying webhook to: ${payment.webhookUrl}`);
      // TODO: Implement webhook delivery logic
      return true;
    } catch (err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err));
  this.logger.error(`Webhook retry failed for ${paymentId}`, error.stack || error.message);
  return false;
}

  }

  @Cron('0 */5 * * * *') // Every 5 minutes
  async retryFailedWebhooks(): Promise<void> {
    this.logger.log('⏲️ Running cron to retry failed webhooks');

    const failedPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.FAILED },
    });

    for (const payment of failedPayments) {
      await this.retryWebhook(payment.id);
    }
  }

  @Cron('0 */10 * * * *') // Every 10 minutes
  async cleanupStaleSessions(): Promise<void> {
    const staleTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    const stalePayments = await this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        updatedAt: LessThan(staleTime),
      },
    });

    if (!stalePayments.length) {
      this.logger.log('🧹 No stale payment sessions found.');
      return;
    }

    for (const payment of stalePayments) {
      this.logger.log(`➡️ Marking payment ${payment.id} as FAILED`);
      payment.status = PaymentStatus.FAILED;
      payment.updatedAt = new Date();
      await this.paymentRepository.save(payment);
    }

    this.logger.log(`✅ Cleaned up ${stalePayments.length} stale sessions.`);
  }
}
