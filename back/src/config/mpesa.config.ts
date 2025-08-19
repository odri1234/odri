import { registerAs } from '@nestjs/config';

export const mpesaConfig = registerAs('mpesa', () => ({
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  shortcode: process.env.MPESA_SHORTCODE || '600000',
  passkey: process.env.MPESA_PASSKEY || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'http://localhost:3000/api/payments/mpesa/callback',
  confirmationUrl: process.env.MPESA_CONFIRMATION_URL || 'http://localhost:3000/api/payments/mpesa/confirmation',
  validationUrl: process.env.MPESA_VALIDATION_URL || 'http://localhost:3000/api/payments/mpesa/validation',
}));