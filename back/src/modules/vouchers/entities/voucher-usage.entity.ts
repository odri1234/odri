import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { User } from '../../users/entities/user.entity';

@Entity('voucher_usages')
export class VoucherUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  voucherId!: string;

  @ManyToOne(() => Voucher, (voucher) => voucher.usageLogs, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'voucherId' })
  voucher!: Voucher;

  @Column({ type: 'uuid' })
  clientId!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'clientId' })
  client?: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceId?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @CreateDateColumn()
  redeemedAt!: Date;
}
