import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Isp } from '../../isps/entities/isp.entity';
import { DeviceParameter } from './device-parameter.entity';
import { DeviceProfile } from './device-profile.entity';
import { ProvisioningJob } from './provisioning-job.entity';
import { FirmwareUpgrade } from './firmware-upgrade.entity';

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROVISIONING = 'provisioning',
  UPGRADING = 'upgrading',
  ERROR = 'error',
}

export enum DeviceType {
  ONT = 'ont',
  ROUTER = 'router',
  SWITCH = 'switch',
  AP = 'access_point',
  STB = 'set_top_box',
  OTHER = 'other',
}

@Entity('tr069_devices')
@Index(['serialNumber'])
@Index(['macAddress'])
@Index(['ispId'])
@Index(['status'])
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  serialNumber!: string;

  @Column({ length: 100, nullable: true })
  macAddress?: string;

  @Column({ length: 100, nullable: true })
  ipAddress?: string;

  @Column({ 
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.ROUTER,
  })
  type!: DeviceType;

  @Column({ 
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.INACTIVE,
  })
  status!: DeviceStatus;

  @Column({ length: 100, nullable: true })
  manufacturer?: string;

  @Column({ length: 100, nullable: true })
  model?: string;

  @Column({ length: 100, nullable: true })
  hardwareVersion?: string;

  @Column({ length: 100, nullable: true })
  softwareVersion?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  lastContactAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastBootTime?: Date;

  @Column({ default: false })
  isOnline!: boolean;

  @Column({ default: false })
  isProvisioned!: boolean;

  @Column({ type: 'uuid', nullable: true })
  profileId?: string;

  @Column({ type: 'uuid' })
  ispId!: string;

  @Column({ type: 'uuid', nullable: true })
  clientId?: string;

  @Column({ type: 'uuid', nullable: true })
  locationId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Isp, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ispId' })
  isp!: Isp;

  @ManyToOne(() => DeviceProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profileId' })
  profile?: DeviceProfile;

  @OneToMany(() => DeviceParameter, parameter => parameter.device)
  parameters!: DeviceParameter[];

  @OneToMany(() => ProvisioningJob, job => job.device)
  provisioningJobs!: ProvisioningJob[];

  @OneToMany(() => FirmwareUpgrade, upgrade => upgrade.device)
  firmwareUpgrades!: FirmwareUpgrade[];
}