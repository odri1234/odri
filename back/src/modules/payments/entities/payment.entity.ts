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
import { User } from '../../users/entities/user.entity';
import { Client } from '../../users/entities/client.entity';
import { Isp } from '../../isps/entities/isp.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'paymentreference', unique: true, nullable: false })
  paymentReference!: string;

  @ManyToOne(() => User, (user) => user.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @Index()
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Client, (client) => client.payments, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'clientId' })
  client?: Client;

  @Column({ nullable: true })
  clientId?: string;

  @ManyToOne(() => Isp, (isp) => isp.payments, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'ispId' })
  isp?: Isp;

  @Column({ nullable: true })
  ispId?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  amount!: number;

  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  refundReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  refundDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhookUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
