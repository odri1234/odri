import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VoucherValidityUnit, VoucherStatus } from '../enums/voucher.enums';
import { Isp } from '../../isps/entities/isp.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { VoucherBatch } from './voucher-batch.entity';
import { VoucherUsage } from './voucher-usage.entity';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column('int')
  amount!: number;

  @Column({ type: 'enum', enum: VoucherValidityUnit })
  validityUnit!: VoucherValidityUnit;

  @Column('int')
  duration!: number;

  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.UNUSED })
  status!: VoucherStatus;

  @Column({ type: 'uuid', nullable: true })
  ispId?: string;

  @ManyToOne(() => Isp, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ispId' })
  isp?: Isp;

  @Column({ type: 'uuid', nullable: true })
  planId?: string;

  @ManyToOne(() => Plan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'planId' })
  plan?: Plan;

  @Column({ type: 'uuid', nullable: true })
  batchId?: string;

  @ManyToOne(() => VoucherBatch, (batch) => batch.vouchers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'batchId' })
  batch?: VoucherBatch;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: false })
  isRedeemed!: boolean;

  @Column({ type: 'uuid', nullable: true })
  redeemedByClientId?: string;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt?: Date;

  @OneToMany(() => VoucherUsage, (usage) => usage.voucher, { cascade: true })
  usageLogs!: VoucherUsage[];

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// ✅ Optional: Re-export enums if used externally in DTOs/services
export { VoucherValidityUnit, VoucherStatus };
