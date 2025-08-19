import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Isp } from '../../isps/entities/isp.entity';

@Entity('revenue_metrics')
export class RevenueMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'int', default: 0 })
  numberOfTransactions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  averageTransactionValue: number;

  @Column({ type: 'varchar', length: 10, default: 'KES' })
  currency: string;

  @ManyToOne(() => Isp, (isp) => isp.revenueMetrics, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ispId' })
  isp: Isp;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
