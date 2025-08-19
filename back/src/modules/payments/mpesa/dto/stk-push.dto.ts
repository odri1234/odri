import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class MpesaStkPushDto {
  @ApiProperty({
    description: 'Amount to be paid in KES',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    description: 'Phone number to receive STK push prompt (format: 2547XXXXXXXX)',
    example: '254712345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({
    description: 'Account reference (e.g., username, account number, or service name)',
    example: 'ODRI',
  })
  @IsString()
  @IsNotEmpty()
  accountReference!: string;

  @ApiProperty({
    description: 'Transaction description or purpose',
    example: 'Payment for internet',
  })
  @IsString()
  @IsNotEmpty()
  transactionDesc!: string;

  @ApiProperty({
    description: 'Optional remarks (e.g., Monthly subscription)',
    required: false,
    example: 'Monthly subscription',
  })
  @IsString()
  @IsOptional()
  remarks?: string;
}
