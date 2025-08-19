import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { Voucher } from './entities/voucher.entity';
import { VoucherBatch } from './entities/voucher-batch.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';
import { User } from '../users/entities/user.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Isp } from '../isps/entities/isp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voucher,
      VoucherBatch,
      VoucherUsage,
      User,
      Plan,
      Isp,
    ]),
  ],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
