import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanPricing } from './plan-pricing.entity';
import { DynamicPricing } from './dynamic-pricing.entity';
import { UsageMetric } from '../../analytics/entities/usage-metric.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ type: 'uuid' })
  ispId!: string;

  @OneToMany(() => PlanPricing, (pricing) => pricing.plan, {
    cascade: true,
  })
  pricings!: PlanPricing[];

  @OneToMany(() => DynamicPricing, (dynamicPricing) => dynamicPricing.plan, {
    cascade: true,
  })
  dynamicPricings!: DynamicPricing[];

  @OneToMany(() => UsageMetric, (usageMetric) => usageMetric.plan)
  usageMetrics?: UsageMetric[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
