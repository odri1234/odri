import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  Version, UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { GenerateBatchDto } from './dto/generate-batch.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { VoucherStatus } from './enums/voucher.enums';

@ApiTags('vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
@ApiOperation({ summary: 'Create a single voucher manually' })
  @ApiResponse({ status: 201, description: 'Voucher created successfully' })
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Post('batch')
@ApiOperation({ summary: 'Generate a batch of vouchers' })
  @ApiResponse({ status: 201, description: 'Batch created and vouchers generated' })
  async generateBatch(@Body() batchDto: GenerateBatchDto) {
    return this.vouchersService.generateBatch(batchDto);
  }

  @Get()
@ApiOperation({ summary: 'List all vouchers with optional filters' })
  @ApiQuery({ name: 'ispId', required: false, description: 'Filter by ISP ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: VoucherStatus,
    description: 'Filter by voucher status',
  })
  @ApiQuery({ name: 'batchId', required: false, description: 'Filter by Batch ID' })
  @ApiResponse({ status: 200, description: 'Vouchers fetched successfully' })
  async findAll(
    @Query('ispId') ispId?: string,
    @Query('status') status?: VoucherStatus,
    @Query('batchId') batchId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.vouchersService.findAll({ 
      ispId, 
      status, 
      batchId, 
      userRole: user?.role 
    });
  }

  @Get(':id')
@ApiOperation({ summary: 'Get voucher by ID' })
  @ApiResponse({ status: 200, description: 'Voucher retrieved' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vouchersService.findOne(id);
  }

  @Post('redeem')
@HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem a voucher code for a client' })
  @ApiResponse({ status: 200, description: 'Voucher redeemed successfully' })
  async redeem(@Body() redeemVoucherDto: RedeemVoucherDto) {
    return this.vouchersService.redeem(redeemVoucherDto);
  }
}
