import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

import { MpesaStkPushDto } from './dto/stk-push.dto';
import { MpesaCallbackDto } from './dto/callback.dto';
import { MpesaQueryStatusDto } from './dto/query-status.dto';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly shortcode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;

  private accessToken = '';
  private tokenExpiresAt = 0;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.getOrThrow<string>('MPESA_BASE_URL');
    this.consumerKey = this.configService.getOrThrow<string>('MPESA_CONSUMER_KEY');
    this.consumerSecret = this.configService.getOrThrow<string>('MPESA_CONSUMER_SECRET');
    this.shortcode = this.configService.getOrThrow<string>('MPESA_SHORTCODE');
    this.passkey = this.configService.getOrThrow<string>('MPESA_PASSKEY');
    this.callbackUrl = this.configService.getOrThrow<string>('MPESA_CALLBACK_URL');
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && this.tokenExpiresAt > now) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${credentials}` },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = now + (response.data.expires_in - 60) * 1000; // expire 1 min early

      this.logger.log('✅ M-Pesa access token obtained');
      return this.accessToken;
    } catch (error) {
      const err = error as AxiosError;
      const msg = err.response?.data || err.message;
      this.logger.error('❌ Failed to get M-Pesa access token', JSON.stringify(msg));
      throw new BadRequestException('Failed to authenticate with M-Pesa');
    }
  }

  async stkPush(stkPushDto: MpesaStkPushDto): Promise<any> {
    const token = await this.getAccessToken();

    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: stkPushDto.amount,
      PartyA: stkPushDto.phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: stkPushDto.phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: stkPushDto.accountReference || 'ODRI',
      TransactionDesc: stkPushDto.transactionDesc || 'Payment for internet service',
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      this.logger.log('✅ STK Push sent: ' + JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      const msg = err.response?.data || err.message;
      this.logger.error('❌ STK Push failed', JSON.stringify(msg));
      throw new BadRequestException('Failed to initiate STK Push');
    }
  }

  async queryTransactionStatus(queryDto: MpesaQueryStatusDto): Promise<any> {
    const token = await this.getAccessToken();

    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: queryDto.checkoutRequestId,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      this.logger.log('✅ Transaction status queried: ' + JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      const msg = err.response?.data || err.message;
      this.logger.error('❌ Failed to query transaction status', JSON.stringify(msg));
      throw new BadRequestException('Failed to query transaction status');
    }
  }

  async handleCallback(callbackDto: MpesaCallbackDto): Promise<boolean> {
    this.logger.log('📥 M-Pesa Callback received: ' + JSON.stringify(callbackDto));

    // TODO: Integrate this method with your PaymentsService to update payment status
    // Example:
    // const checkoutId = callbackDto.Body?.stkCallback?.CheckoutRequestID;
    // if (checkoutId) {
    //   await this.paymentService.updatePaymentStatusByCheckoutId(checkoutId, status);
    // }

    return true;
  }

  private getTimestamp(): string {
    // Format: YYYYMMDDHHMMSS
    return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  }
}
