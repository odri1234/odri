import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Plan } from './plan.entity';

@Entity('plan_pricing')
@Unique(['plan', 'priceType'])
export class PlanPricing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Plan, (plan) => plan.pricings, { onDelete: 'CASCADE' })
  plan!: Plan;

  @Column({ type: 'varchar', length: 50 })
  priceType!: string; // e.g., 'monthly', 'yearly', 'daily'

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
