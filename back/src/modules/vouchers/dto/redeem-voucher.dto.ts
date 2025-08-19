// vouchers/dto/redeem-voucher.dto.ts
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemVoucherDto {
  @ApiProperty({
    description: 'The voucher code to redeem (case-sensitive)',
    example: 'BEAST-2025-10GB',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'UUID of the client redeeming the voucher',
    example: 'c4e1b2e8-88dd-4ec1-aac6-3dd2ea8912aa',
  })
  @IsUUID('4', { message: 'clientId must be a valid UUID v4' })
  clientId!: string;
}
