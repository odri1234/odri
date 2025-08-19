import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { User } from '../../users/entities/user.entity';

@Entity('usage_logs')
export class UsageLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Link to user
  @ManyToOne(() => User, (user) => user.usageLogs, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  // Link to session
  @ManyToOne(() => Session, (session) => session.usageLogs, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'sessionId' })
  session!: Session;

  @Column()
  sessionId!: string;

  // Usage stats
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dataUsed!: number;

  @Column({ type: 'bigint', default: 0 })
  uploadBytes!: number;

  @Column({ type: 'bigint', default: 0 })
  downloadBytes!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  usageStartTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  usageEndTime?: Date;

  // Meta
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
