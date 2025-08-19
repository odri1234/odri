import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundDto {
  @ApiProperty({ example: '8e21e90c-8e5a-4a2c-bd26-51ec5a902a1d' })
  @IsString()
  @IsNotEmpty()
  paymentId!: string; // Unique ID of the payment to refund

  @ApiProperty({ example: 500.00 })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ example: 'User requested refund for failed service' })
  @IsString()
  @IsNotEmpty()   // changed to required
  reason!: string;

  @ApiPropertyOptional({ example: 'REFUND_MPESA_123456' })
  @IsString()
  @IsOptional()
  refundReference?: string;
}
