import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Device } from './device.entity';

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobType {
  INITIAL_PROVISION = 'initial_provision',
  RECONFIGURE = 'reconfigure',
  FACTORY_RESET = 'factory_reset',
  REBOOT = 'reboot',
  PARAMETER_UPDATE = 'parameter_update',
}

@Entity('tr069_provisioning_jobs')
@Index(['deviceId', 'status'])
export class ProvisioningJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.PARAMETER_UPDATE,
  })
  type!: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status!: JobStatus;

  @Column({ type: 'jsonb', nullable: true })
  parameters?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  result?: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Device, device => device.provisioningJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device!: Device;
}