import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Isp } from '../../isps/entities/isp.entity';

@Entity('usage_metrics')
export class UsageMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('date')
  date!: string;

  @Column({ type: 'int', default: 0 })
  activeSessions!: number; // Added or confirmed

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'total_data_used_mb', // Corrected DB column name
  })
  totalDataUsedMB!: number;

  @ManyToOne(() => Isp, (isp) => isp.usageMetrics)
  isp!: Isp;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
