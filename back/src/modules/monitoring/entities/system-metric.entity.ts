import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Isp } from '../../../modules/isps/entities/isp.entity';

export enum MetricType {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  DISK = 'DISK',
  NETWORK = 'NETWORK',
  TEMPERATURE = 'TEMPERATURE',
  UPTIME = 'UPTIME',
}

@Entity('system_metrics')
export class SystemMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Isp, (isp) => isp.systemMetrics, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  isp?: Isp;

  @Column()
  ipAddress!: string;

  @Column()
  deviceName!: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  type!: MetricType;

  @Column('float')
  value!: number;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp!: Date;
}
