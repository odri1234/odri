import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Isp } from '../../../modules/isps/entities/isp.entity';

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  OFFLINE = 'OFFLINE',
}

@Entity('health_checks')
export class HealthCheck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Isp, (isp) => isp.healthChecks, { onDelete: 'CASCADE', nullable: true })
  isp?: Isp;

  @Column()
  ipAddress!: string;

  @Column()
  deviceName!: string;

  @Column('float')
  cpuUsage!: number;

  @Column('float')
  memoryUsage!: number;

  @Column('float')
  diskUsage!: number;

  @Column({
    type: 'enum',
    enum: HealthStatus,
    default: HealthStatus.HEALTHY,
  })
  status!: HealthStatus;

  @Column({ nullable: true })
  message?: string;

  @CreateDateColumn()
  checkedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
