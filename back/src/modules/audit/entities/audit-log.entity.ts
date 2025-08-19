import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { LogAction } from '../enums/log-action.enum';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 100 })
  username: string;

  @Column({ type: 'enum', enum: LogAction })
  action: LogAction;

  @Column('text', { nullable: true })
  details?: string;

  @Column('text')
  description: string;

  @Column({ nullable: true, length: 255 })
  route?: string;

  @Column({ nullable: true, length: 45 })
  ipAddress?: string;

  @Column({ nullable: true, length: 500 })
  userAgent?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  // Added metadata column as JSON and nullable
  @Column('json', { nullable: true })
  metadata?: Record<string, any>;
}
