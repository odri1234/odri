import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

@Entity({ name: 'system_logs' })
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: LogLevel, default: LogLevel.INFO })
  level!: LogLevel;

  @Column({ length: 255 })
  source!: string; // e.g. module or service name

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp!: Date;
}
