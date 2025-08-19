// src/modules/analytics/entities/usage-metric.entity.ts

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

import { Plan } from '../../plans/entities/plan.entity';

@Entity('usage_metrics')
export class UsageMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'bigint', name: 'total_data_used_mb' })
  totalDataUsedMB!: number;

  @Column({ type: 'int', name: 'active_sessions', default: 0 })
  activeSessions!: number;

  @Column({ type: 'int', default: 0 })
  uniqueUsers!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timePeriod?: string;

  @Column({ type: 'float' })
  averageSessionDurationMinutes!: number;

  @Column({ type: 'int' })
  peakUsageHour!: number;

  // Add the ManyToOne relation to Plan entity
  @ManyToOne(() => Plan, (plan) => plan.usageMetrics, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan!: Plan;

  @Column('uuid')
  planId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
