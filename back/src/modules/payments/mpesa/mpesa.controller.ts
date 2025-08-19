// payments/mpesa/mpesa.controller.ts
import {
  Version, Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { MpesaService } from './mpesa.service';
import { MpesaStkPushDto } from './dto/stk-push.dto';
import { MpesaCallbackDto } from './dto/callback.dto';
import { MpesaQueryStatusDto } from './dto/query-status.dto';

@ApiTags('mpesa')
@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post('stk-push')
@ApiOperation({ summary: 'Initiate M-Pesa STK Push payment' })
  @ApiResponse({ status: 200, description: 'STK Push initiated successfully' })
  async stkPush(@Body() stkPushDto: MpesaStkPushDto) {
    const response = await this.mpesaService.stkPush(stkPushDto);
    return response;
  }

  @Post('callback')
@HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive M-Pesa payment callback' })
  @ApiResponse({ status: 200, description: 'Callback received successfully' })
  async handleCallback(@Body() callbackDto: MpesaCallbackDto) {
    await this.mpesaService.handleCallback(callbackDto);
    return { message: 'Callback processed' };
  }

  @Get('query-status')
@ApiOperation({ summary: 'Query M-Pesa transaction status' })
  @ApiResponse({ status: 200, description: 'Transaction status retrieved' })
  async queryStatus(@Query() queryDto: MpesaQueryStatusDto) {
    const status = await this.mpesaService.queryTransactionStatus(queryDto);
    return status;
  }
}
