import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from '../modules/payments/payments.service';
import { MpesaService } from '../modules/payments/mpesa/mpesa.service';

@Injectable()
export class PaymentProcessingJob {
  private readonly logger = new Logger(PaymentProcessingJob.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mpesaService: MpesaService,
  ) {}

  // Runs every minute to check pending MPESA payments
  @Cron(CronExpression.EVERY_MINUTE)
  async syncPendingMpesaTransactions(): Promise<void> {
    this.logger.log('Checking for pending MPESA transactions...');
    try {
      await this.mpesaService.queryTransactionStatus({
        // You may need to dynamically get IDs from somewhere
        checkoutRequestId: 'mock-or-real-id', // Placeholder — replace with real logic
      });
      this.logger.log('Pending MPESA transactions synced.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.stack || error.message : String(error);
      this.logger.error('Error syncing MPESA transactions', errorMessage);
    }
  }

  // Runs every 5 minutes to retry failed payments
  @Cron('*/5 * * * *')
  async retryFailedPayments(): Promise<void> {
    this.logger.log('Retrying failed payments...');
    try {
      await this.paymentsService.retryFailedWebhooks();
      this.logger.log('Failed payments reprocessed.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.stack || error.message : String(error);
      this.logger.error('Error retrying payments', errorMessage);
    }
  }

  // Optional: runs every 10 minutes to clean up stale sessions/payments
  @Cron('*/10 * * * *')
  async cleanupStalePaymentSessions(): Promise<void> {
    this.logger.log('Cleaning up stale payment sessions...');
    try {
      // You can implement a real stale cleanup method if it exists
      this.logger.warn('⚠️ cleanupStaleSessions not yet implemented in PaymentsService');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.stack || error.message : String(error);
      this.logger.error('Error cleaning stale payment sessions', errorMessage);
    }
  }
}
