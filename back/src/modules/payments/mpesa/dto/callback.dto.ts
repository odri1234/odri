import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class CallbackMetadataItem {
  @ApiProperty({ description: 'Name of the metadata item', example: 'Amount' })
  @IsString()
  Name!: string;

  @ApiProperty({ description: 'Value of the metadata item', example: 100 })
  Value!: any;
}

class CallbackMetadata {
  @ApiProperty({ type: [CallbackMetadataItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallbackMetadataItem)
  Item!: CallbackMetadataItem[];
}

class StkCallback {
  @ApiProperty({ description: 'Unique checkout request ID', example: 'ws_CO_12345' })
  @IsString()
  CheckoutRequestID!: string;

  @ApiProperty({ description: 'Result code (0 means success)', example: 0 })
  @IsNumber()
  ResultCode!: number;

  @ApiProperty({ description: 'Result description', example: 'The service request is processed successfully.' })
  @IsString()
  ResultDesc!: string;

  @ApiProperty({ description: 'Callback metadata (optional)', required: false, type: CallbackMetadata })
  @IsOptional()
  @ValidateNested()
  @Type(() => CallbackMetadata)
  CallbackMetadata?: CallbackMetadata;
}

class MpesaCallbackBody {
  @ApiProperty({ type: StkCallback })
  @ValidateNested()
  @Type(() => StkCallback)
  stkCallback!: StkCallback;
}

export class MpesaCallbackDto {
  @ApiProperty({ type: MpesaCallbackBody })
  @ValidateNested()
  @Type(() => MpesaCallbackBody)
  Body!: MpesaCallbackBody;
}
