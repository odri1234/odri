import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MpesaTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('mpesa_transactions')
export class MpesaTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  transactionId!: string; // MPESA transaction ID (e.g., from callback)

  @Column()
  phoneNumber!: string; // Customer phone number initiating transaction

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  accountReference!: string; // Account or service reference (e.g., user or invoice)

  @Column({ nullable: true })
  transactionDesc?: string; // Optional description

  @Column({
    type: 'enum',
    enum: MpesaTransactionStatus,
    default: MpesaTransactionStatus.PENDING,
  })
  status!: MpesaTransactionStatus;

  @Column({ nullable: true })
  receiptNumber?: string; // MPESA receipt number

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
