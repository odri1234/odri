import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { NotificationChannel, NotificationPriority } from '../enums/notification.enums';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  recipient!: string;

  @Column()
  subject!: string;

  @Column('text')
  message!: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel!: NotificationChannel;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority!: NotificationPriority;

  @Column({ default: true })
  success!: boolean;

  @CreateDateColumn()
  sentAt!: Date;
}
