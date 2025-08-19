import {
  Version, Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundDto } from './dto/refund.dto';
import { MpesaCallbackDto } from './mpesa/dto/callback.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
@ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log('📥 Creating new payment');
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Post('refund')
@ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refundPayment(@Body() refundDto: RefundDto) {
    this.logger.log('↩️ Processing refund');
    const { paymentId, reason } = refundDto;
    return this.paymentsService.refundPayment(paymentId, reason);
  }

  @Get('status/:transactionId')
@ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  async getPaymentStatus(@Param('transactionId') transactionId: string) {
    this.logger.log(`🔎 Checking payment status for transaction ID: ${transactionId}`);
    return this.paymentsService.getPaymentStatus(transactionId);
  }

  @Get('history')
@ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  async getPaymentHistory(
    @Query('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    this.logger.log(`📜 Fetching payment history for userId: ${userId}`);
    return this.paymentsService.getPaymentHistory(userId, status, +page, +limit);
  }

  @Post('mpesa/callback')
@HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle M-Pesa payment callback' })
  @ApiResponse({ status: 200, description: 'Callback handled successfully' })
  async mpesaCallback(@Body() callbackBody: MpesaCallbackDto) {
    this.logger.log('📲 Received M-Pesa callback');
    return this.paymentsService.handleMpesaCallback(callbackBody);
  }
}
