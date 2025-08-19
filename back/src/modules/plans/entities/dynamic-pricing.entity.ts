// plans/entities/dynamic-pricing.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plan } from './plan.entity';

@Entity('dynamic_pricing')
export class DynamicPricing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Plan, (plan) => plan.dynamicPricings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  plan!: Plan;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'timestamp' })
  startTime!: Date;

  @Column({ type: 'timestamp' })
  endTime!: Date;

  @Column({ type: 'text', nullable: true })
  conditions?: string; // Optional descriptive conditions or JSON string

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
