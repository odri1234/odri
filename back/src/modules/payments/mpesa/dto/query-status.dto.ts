import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MpesaQueryStatusDto {
  @ApiProperty({
    description: 'CheckoutRequestID returned by the initial STK push response',
    example: 'ws_CO_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  checkoutRequestId!: string;
}
