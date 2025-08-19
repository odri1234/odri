import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Device } from './device.entity';
import { UsageLog } from './usage-log.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../../users/entities/client.entity'; // ✅ Added import

export enum SessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('sessions')
export class Session {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column()
  ipAddress!: string;

  @ApiProperty()
  @Column()
  ispId!: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  userAgent?: string;

  @ApiProperty({ enum: SessionStatus, default: SessionStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status!: SessionStatus;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startTime!: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  notes?: string;

  @ApiProperty()
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty({ example: 'user-uuid', required: false })
  @Column({ nullable: true })
  userId?: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.sessions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ApiProperty({ type: () => [Device] })
  @OneToMany(() => Device, (device) => device.session, {
    cascade: true,
  })
  devices!: Device[];

  @ApiProperty({ type: () => [UsageLog] })
  @OneToMany(() => UsageLog, (log) => log.session)
  usageLogs!: UsageLog[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({ example: 0, description: 'Number of times device changed during session' })
  @Column({ type: 'int', default: 0 })
  deviceChanges!: number;

  @ApiProperty({ example: 0, description: 'Number of times IP address changed during session' })
  @Column({ type: 'int', default: 0 })
  ipChanges!: number;

  // ✅ NEW: Relation to Client
  @ApiProperty({ type: () => Client, description: 'Client associated with this session' })
  @ManyToOne(() => Client, (client) => client.sessions, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  client?: Client;
}
