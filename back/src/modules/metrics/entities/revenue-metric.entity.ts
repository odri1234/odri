import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Isp } from '../../isps/entities/isp.entity';
@Entity('revenue_metrics')
export class RevenueMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('date')
  date!: string; // Keep as string but use 'date' type for DB column

  @Column('decimal', { precision: 10, scale: 2 })
  totalRevenue!: number;

  @Column({ nullable: true })
  currency?: string;

  @ManyToOne(() => Isp, (isp) => isp.revenueMetrics) // Use 'Isp' not 'ISP'
  isp!: Isp;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
