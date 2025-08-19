import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';

// ✅ Moved PaymentMethod enum out for shared reuse if needed later
export enum PaymentMethod {
  MPESA = 'mpesa',
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'd0d3b123-aabc-4ef1-ae2c-88c79b1e3021' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 1000.00 })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  amount!: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: 'MPESA123XYZ' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'Monthly internet payment' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  @IsOptional()
  status?: PaymentStatus;
}
