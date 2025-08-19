import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '../enums/notification.enums';
import { User } from '../../users/entities/user.entity';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel!: NotificationChannel;

  @Column({ nullable: true })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'simple-array' })
  recipients!: string[];

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status!: NotificationStatus;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority!: NotificationPriority;

  @Column({ default: false })
  success!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  ispId?: string;

  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  referenceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
