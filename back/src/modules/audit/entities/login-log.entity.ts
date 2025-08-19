import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  LOCKED = 'LOCKED',
  LOGOUT = 'LOGOUT',
}

@Entity({ name: 'login_logs' })
export class LoginLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ length: 100, nullable: true })
  username?: string;

  @Column({ type: 'enum', enum: LoginStatus })
  status: LoginStatus;

  @Column('boolean', { default: true })
  success: boolean;

  @Column({ nullable: true, length: 45 })
  ipAddress?: string;

  @Column({ nullable: true, length: 500 })
  userAgent?: string;

  @Column({ nullable: true, length: 255 })
  failureReason?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;
}
