import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Isp } from '../../isps/entities/isp.entity'; // ✅ Import Isp entity

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'TXN123456789' })
  @Column({ unique: true })
  transactionReference!: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty()
  @Column()
  userId!: string;

  @ApiProperty({ example: 1000.50 })
  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.PAYMENT })
  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.PENDING })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @ApiProperty({ example: 'mpesa' })
  @Column({ nullable: true })
  paymentMethod?: string;

  @ApiProperty({ example: 'MPESA123XYZ' })
  @Column({ nullable: true })
  externalTransactionId?: string;

  @ApiProperty({ example: 'Payment for July subscription' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ example: '2025-07-14T10:00:00Z' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ example: '2025-07-14T10:00:00Z' })
  @UpdateDateColumn()
  updatedAt!: Date;

  // ✅ ISP Relationship
  @ApiProperty({ type: () => Isp, required: false })
  @ManyToOne(() => Isp, (isp) => isp.transactions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ispId' })
  isp?: Isp;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  ispId?: string;
}
