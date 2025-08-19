// payments/mpesa/dto/refund.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RefundDto {
  @ApiProperty({
    description: 'The unique ID of the payment to be refunded (e.g., UUID)',
    example: '9f8a1c02-d8ee-4b1a-bc61-b1c7f1ff5a14',
  })
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({
    description: 'The reason for issuing the refund',
    example: 'User overpaid or canceled subscription',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
