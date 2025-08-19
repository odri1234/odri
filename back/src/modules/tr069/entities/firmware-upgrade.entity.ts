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

export enum UpgradeStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  INSTALLING = 'installing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('tr069_firmware_upgrades')
@Index(['deviceId', 'status'])
export class FirmwareUpgrade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @Column({ length: 255 })
  firmwareVersion!: string;

  @Column({ length: 255 })
  firmwareUrl!: string;

  @Column({
    type: 'enum',
    enum: UpgradeStatus,
    default: UpgradeStatus.PENDING,
  })
  status!: UpgradeStatus;

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
  @ManyToOne(() => Device, device => device.firmwareUpgrades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device!: Device;
}