// src/modules/payments/enums/payment-status.enum.ts

/**
 * PaymentStatus defines all possible states a payment can be in.
 */
export enum PaymentStatus {
  /**
   * Payment is initiated but not yet completed.
   */
  PENDING = 'PENDING',

  /**
   * Payment has been successfully completed.
   */
  COMPLETED = 'COMPLETED',

  /**
   * Payment failed due to an error (e.g. network, insufficient funds).
   */
  FAILED = 'FAILED',

  /**
   * Payment was cancelled by the user or system.
   */
  CANCELLED = 'CANCELLED',

  /**
   * Payment was refunded after a successful transaction.
   */
  REFUNDED = 'REFUNDED',
}
