import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from './user.entity';
import { Isp } from '../../isps/entities/isp.entity';
import { Session } from '../../sessions/entities/session.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { UsageLog } from '../../usage/entities/usage-log.entity'; // ✅ Correct import path

export enum ClientStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

export enum ConnectionType {
  HOTSPOT = 'hotspot',
  PPPOE = 'pppoe',
  STATIC = 'static',
  DHCP = 'dhcp',
}

export interface ClientMetadata {
  package?: string;
  bandwidthLimit?: string;
  dataLimit?: string;
  priority?: number;
  customFields?: Record<string, any>;
  billingInfo?: {
    plan: string;
    amount: number;
    currency: string;
    cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  connectionInfo?: {
    connectionType: ConnectionType;
    vlan?: number;
    queueName?: string;
  };
  suspensionReason?: string;
}

@Entity('clients')
@Index(['macAddress', 'ipAddress', 'status', 'isActive', 'expiryDate', 'lastLoginAt'])
export class Client {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => User })
  @OneToOne(() => User, { cascade: ['insert', 'update'], onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', unique: true })
  @Index()
  userId: string;

  @ApiProperty({ type: () => Isp })
  @ManyToOne(() => Isp, (isp) => isp.clients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ispId' })
  isp: Isp;

  @Column({ type: 'uuid' })
  ispId: string;

  @Column({ nullable: true, length: 17 })
  macAddress?: string;

  @Column({ nullable: true, length: 45 })
  ipAddress?: string;

  @Column({ type: 'uuid', nullable: true })
  routerId?: string;

  @Column({ nullable: true, length: 100 })
  profileName?: string;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.PENDING })
  status: ClientStatus;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ConnectionType, default: ConnectionType.HOTSPOT })
  connectionType: ConnectionType;

  @Column({ nullable: true, length: 20 })
  bandwidthLimit?: string;

  @Column({ nullable: true, length: 20 })
  dataLimit?: string;

  @Column({ type: 'bigint', nullable: true })
  dataLimitBytes?: number;

  @Column({ type: 'bigint', default: 0 })
  dataUsed: number;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'int', nullable: true })
  vlanId?: number;

  @Column({ nullable: true, length: 100 })
  queueName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextBillingDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 3, default: 'KES' })
  currency: string;

  @Column({ nullable: true, length: 20 })
  billingCycle?: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'int', default: 1 })
  maxSessions: number;

  @Column({ type: 'int', default: 0 })
  currentSessions: number;

  @Column({ type: 'int', default: 0 })
  totalSessions: number;

  @Column({ nullable: true, length: 45 })
  lastKnownIp?: string;

  @Column({ nullable: true, length: 255 })
  lastUserAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: ClientMetadata;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  // Relationships
  @OneToMany(() => Session, (session) => session.client, { lazy: true })
  sessions: Session[];

  @OneToMany(() => Payment, (payment) => payment.client, { lazy: true })
  payments: Payment[];

  @OneToMany(() => UsageLog, (log) => log.client, { lazy: true })
  usageLogs: UsageLog[];

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateStatus() {
    if (!this.isActive) {
      this.status = ClientStatus.SUSPENDED;
    } else if (this.isExpired()) {
      this.status = ClientStatus.EXPIRED;
    } else if (this.balance < 0) {
      this.status = ClientStatus.SUSPENDED;
    } else {
      this.status = ClientStatus.ACTIVE;
    }
  }

  @BeforeInsert()
  setDefaults() {
    this.priority ??= 5;
    this.maxSessions ??= 1;
    this.currency ??= 'KES';
    this.dataUsed ??= 0;
    this.totalSessions ??= 0;
    this.currentSessions ??= 0;
  }

  // Methods
  isExpired(): boolean {
    return this.expiryDate ? new Date() > this.expiryDate : false;
  }

  isDataLimitExceeded(): boolean {
    return this.dataLimitBytes ? this.dataUsed >= this.dataLimitBytes : false;
  }

  canConnect(): boolean {
    return (
      this.isActive &&
      !this.isExpired() &&
      !this.isDataLimitExceeded() &&
      this.status === ClientStatus.ACTIVE &&
      this.currentSessions < this.maxSessions
    );
  }

  getRemainingData(): number {
    if (!this.dataLimitBytes) return -1;
    return Math.max(0, this.dataLimitBytes - this.dataUsed);
  }

  getDataUsagePercentage(): number {
    if (!this.dataLimitBytes) return 0;
    return Math.min(100, (this.dataUsed / this.dataLimitBytes) * 100);
  }

  addDataUsage(bytes: number): void {
    this.dataUsed += bytes;
    this.lastActivityAt = new Date();
  }

  resetDataUsage(): void {
    this.dataUsed = 0;
  }

  incrementSession(): void {
    this.currentSessions++;
    this.totalSessions++;
    this.lastLoginAt = new Date();
    this.isOnline = true;
  }

  decrementSession(): void {
    this.currentSessions = Math.max(0, this.currentSessions - 1);
    if (this.currentSessions === 0) this.isOnline = false;
  }

  suspend(reason?: string): void {
    this.isActive = false;
    this.status = ClientStatus.SUSPENDED;
    if (reason) {
      this.metadata ??= {};
      this.metadata.suspensionReason = reason;
    }
  }

  activate(): void {
    this.isActive = true;
    this.status = ClientStatus.ACTIVE;
    if (this.metadata?.suspensionReason) {
      delete this.metadata.suspensionReason;
    }
  }

  extendExpiry(days: number): void {
    const base = this.expiryDate || new Date();
    this.expiryDate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  }

  addBalance(amount: number): void {
    this.balance += amount;
  }

  deductBalance(amount: number): boolean {
    if (this.balance >= amount) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  updateLastActivity(ip?: string, userAgent?: string): void {
    this.lastActivityAt = new Date();
    if (ip) this.lastKnownIp = ip;
    if (userAgent) this.lastUserAgent = userAgent;
  }
}
