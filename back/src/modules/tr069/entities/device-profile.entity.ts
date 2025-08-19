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
import { Device } from './device.entity';

@Entity('tr069_device_profiles')
@Index(['name', 'ispId'], { unique: true })
export class DeviceProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  parameters!: Record<string, any>;

  @Column({ type: 'uuid' })
  ispId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  deviceType?: string;

  @Column({ type: 'text', nullable: true })
  manufacturer?: string;

  @Column({ type: 'text', nullable: true })
  model?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Isp, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ispId' })
  isp!: Isp;

  @OneToMany(() => Device, device => device.profile)
  devices!: Device[];
}