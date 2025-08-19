import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Voucher } from './entities/voucher.entity';
import { VoucherBatch } from './entities/voucher-batch.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import { GenerateBatchDto } from './dto/generate-batch.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { VoucherStatus, VoucherValidityUnit } from './enums/voucher.enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,

    @InjectRepository(VoucherBatch)
    private readonly batchRepo: Repository<VoucherBatch>,

    @InjectRepository(VoucherUsage)
    private readonly usageRepo: Repository<VoucherUsage>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateVoucherDto) {
    const voucher = this.voucherRepo.create({
      ...dto,
      status: VoucherStatus.UNUSED,
      isRedeemed: false,
      redeemedAt: undefined, // ✅ changed from null
      expiresAt: this.calculateExpiry(dto.duration, dto.validityUnit),
    });

    return this.voucherRepo.save(voucher);
  }

  async generateBatch(dto: GenerateBatchDto) {
    const {
      count,
      amount,
      validityUnit,
      duration,
      prefix,
      ispId,
      planId,
      metadata,
    } = dto;

    const batch = this.batchRepo.create({
      name: metadata || `Batch-${Date.now()}`,
      totalVouchers: count,
      redeemedCount: 0,
      prefix: prefix || '',
      ispId,
      metadata,
    });

    const savedBatch = await this.batchRepo.save(batch); // ✅ returns single object

    const vouchers: Voucher[] = Array.from({ length: count }).map(() =>
      this.voucherRepo.create({
        code: this.generateCode(prefix),
        amount,
        validityUnit,
        duration,
        status: VoucherStatus.UNUSED,
        isRedeemed: false,
        ispId,
        planId,
        batchId: savedBatch.id, // ✅ safe because savedBatch is an object
        redeemedAt: undefined,
        expiresAt: this.calculateExpiry(duration, validityUnit),
      }),
    );

    const saved = await this.voucherRepo.save(vouchers);

    return {
      batchId: savedBatch.id,
      count: saved.length,
    };
  }

  async findAll(filters: {
    ispId?: string;
    status?: VoucherStatus;
    batchId?: string;
    userRole?: string;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    // Skip ispId filtering for SUPER_ADMIN role
    if (filters.ispId && filters.userRole !== 'SUPER_ADMIN') where.ispId = filters.ispId;
    if (filters.batchId) where.batchId = filters.batchId;

    return this.voucherRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const voucher = await this.voucherRepo.findOne({ where: { id } });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async redeem(dto: RedeemVoucherDto) {
    const voucher = await this.voucherRepo.findOne({
      where: { code: dto.code },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (voucher.status !== VoucherStatus.UNUSED) {
      throw new BadRequestException('Voucher already used or inactive');
    }

    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      throw new BadRequestException('Voucher has expired');
    }

    const client = await this.userRepo.findOne({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    voucher.status = VoucherStatus.USED;
    voucher.isRedeemed = true;
    voucher.redeemedByClientId = client.id;
    voucher.redeemedAt = new Date();

    await this.voucherRepo.save(voucher);

    const usage = this.usageRepo.create({
      voucherId: voucher.id,
      clientId: client.id,
    });

    await this.usageRepo.save(usage);

    return {
      success: true,
      message: 'Voucher redeemed successfully',
      amount: voucher.amount,
    };
  }

  private generateCode(prefix?: string): string {
    const code = uuidv4().split('-')[0].toUpperCase();
    return prefix ? `${prefix}-${code}` : code;
  }

  private calculateExpiry(
    duration: number,
    unit: VoucherValidityUnit,
  ): Date {
    const now = new Date();
    switch (unit) {
      case VoucherValidityUnit.HOURS:
        return new Date(now.getTime() + duration * 60 * 60 * 1000);
      case VoucherValidityUnit.DAYS:
        return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
      case VoucherValidityUnit.WEEKS:
        return new Date(now.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
      default:
        throw new BadRequestException('Invalid voucher validity unit');
    }
  }
}
