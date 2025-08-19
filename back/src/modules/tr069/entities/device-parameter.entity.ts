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

export enum ParameterType {
  STRING = 'string',
  INT = 'int',
  UINT = 'uint',
  BOOLEAN = 'boolean',
  DATETIME = 'datetime',
  BASE64 = 'base64',
  OBJECT = 'object',
}

@Entity('tr069_device_parameters')
@Index(['deviceId', 'name'], { unique: true })
export class DeviceParameter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  deviceId!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  value?: string;

  @Column({
    type: 'enum',
    enum: ParameterType,
    default: ParameterType.STRING,
  })
  type!: ParameterType;

  @Column({ default: false })
  writable!: boolean;

  @Column({ default: false })
  isNotification!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastUpdated?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Device, device => device.parameters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device!: Device;
}