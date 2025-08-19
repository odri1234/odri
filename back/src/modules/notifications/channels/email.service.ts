import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');
    const secure = this.configService.get<string>('EMAIL_SECURE') === 'true';

    this.defaultFrom =
      this.configService.get<string>('EMAIL_FROM') || '"ODRI WiFi" <no-reply@odriwifi.com>';

    // Validate email configuration
    if (!host || !port || !user || !pass) {
      this.logger.error('🚨 Missing required email configuration. Check .env file.');
      throw new InternalServerErrorException('Email configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to,
        subject,
        html,
      });

      this.logger.log(`📧 Email sent to ${to} - Message ID: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to ${to}`, {
        message: error?.message,
        stack: error?.stack,
        response: error?.response || null,
      });
      throw new InternalServerErrorException('Failed to send email. Please try again later.');
    }
  }
}
