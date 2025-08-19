import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { Isp } from '../../isps/entities/isp.entity';

@Entity('voucher_batches') // Explicit table name
export class VoucherBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: '' })
  prefix!: string; // ✅ Added prefix field since it's used in .create()

  @Column({ default: 0 })
  totalVouchers!: number;

  @Column({ default: 0 })
  redeemedCount!: number;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @Column({ type: 'uuid', nullable: true })
  ispId?: string;

  @ManyToOne(() => Isp, (isp) => isp.voucherBatches, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ispId' })
  isp?: Isp;

  @OneToMany(() => Voucher, (voucher) => voucher.batch, {
    cascade: true,
  })
  vouchers!: Voucher[];

  @CreateDateColumn()
  createdAt!: Date;
}
