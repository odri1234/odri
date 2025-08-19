import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum'; // ✅ Use shared enum

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  paymentProvider!: string; // e.g., 'mpesa', 'paypal'

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  callbackTime?: string; // ISO timestamp
}
