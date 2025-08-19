import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly httpClient: AxiosInstance;

  private readonly smsApiUrl: string;
  private readonly smsApiKey: string;
  private readonly senderId: string;

  constructor(private readonly configService: ConfigService) {
    this.smsApiUrl = this.configService.get<string>('SMS_API_URL') ?? '';
    this.smsApiKey = this.configService.get<string>('SMS_API_KEY') ?? '';
    this.senderId = this.configService.get<string>('SMS_SENDER_ID') || 'ODRIWIFI';

    if (!this.smsApiUrl || !this.smsApiKey) {
      this.logger.error('Missing SMS API config. Check SMS_API_URL and SMS_API_KEY in env.');
      throw new InternalServerErrorException('SMS API config is missing');
    }

    this.httpClient = axios.create({
      baseURL: this.smsApiUrl,
      timeout: 7000, // more robust timeout for production
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async sendSms(to: string, message: string): Promise<void> {
    const payload = {
      to,
      message,
      sender: this.senderId,
      apiKey: this.smsApiKey,
    };

    try {
      const response = await this.httpClient.post('', payload);

      if (response.status >= 200 && response.status < 300) {
        this.logger.log(`✅ SMS sent to ${to} - API Response: ${JSON.stringify(response.data)}`);
      } else {
        this.logger.warn(
          `⚠️ SMS API responded with status ${response.status}: ${response.statusText}`,
        );
      }
    } catch (error) {
      const err = error as AxiosError;

      this.logger.error(`❌ Failed to send SMS to ${to}`, {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
      });

      throw new InternalServerErrorException('Failed to send SMS. Please try again later.');
    }
  }
}
