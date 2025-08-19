import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from '../constants/user-role.constants';

import { Payment } from '../../payments/entities/payment.entity';
import { Transaction } from '../../payments/entities/transaction.entity';
import { Session } from '../../sessions/entities/session.entity';
import { UsageLog } from '../../sessions/entities/usage-log.entity';
import { Isp } from '../../isps/entities/isp.entity';
import { HotspotProfile } from '../../mikrotik/entities/hotspot-profile.entity';
import { PppoeProfile } from '../../mikrotik/entities/pppoe-profile.entity';
import { Router } from '../../mikrotik/entities/router.entity';
import { Alert } from '../../monitoring/entities/alert.entity';
import { AnalyticsReport } from '../../analytics/entities/analytics-report.entity';

@Entity('users')
@Index(['email'])
@Index(['phone'])
@Index(['role'])
@Index(['isActive'])
@Index(['tenantId']) // Added index for multi-tenant support
@Index(['emailVerified'])
export class User {
  @ApiProperty({ 
    example: 'b81e2c2e-8f78-4e13-a103-0f558a6cde88',
    description: 'Unique identifier for the user'
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'User email address (unique)'
  })
  @Column({ unique: true, length: 255 })
  email!: string;

  @ApiProperty({ 
    example: 'John Doe',
    description: 'Full name of the user'
  })
  @Column({ length: 255 })
  fullName!: string;

  @ApiPropertyOptional({ 
    example: 'John',
    description: 'First name of the user (derived from fullName)'
  })
  @Column({ length: 100, nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ 
    example: 'Doe',
    description: 'Last name of the user (derived from fullName)'
  })
  @Column({ length: 100, nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ 
    example: '0712345678',
    description: 'Phone number (unique when provided)'
  })
  @Column({ unique: true, length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ 
    example: 'hashedPassword123',
    description: 'Encrypted password'
  })
  @Exclude()
  @Column({ length: 255 })
  password!: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.CLIENT,
    description: 'User role in the system'
  })
  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @ApiProperty({ 
    example: true,
    description: 'Whether the user account is active'
  })
  @Column({ default: true })
  isActive!: boolean;

  @ApiPropertyOptional({ 
    example: false,
    description: 'Whether two-factor authentication is enabled'
  })
  @Column({ default: false })
  twoFactorEnabled!: boolean;

  @ApiPropertyOptional({ 
    example: 'BASE32ENCODEDSECRET',
    description: 'Two-factor authentication secret'
  })
  @Exclude()
  @Column({ nullable: true, length: 255 })
  twoFactorSecret?: string;

  @ApiPropertyOptional({ 
    example: 'reset-token-uuid',
    description: 'Password reset token'
  })
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken?: string | null;

  @ApiPropertyOptional({ 
    example: '2025-07-18T12:00:00.000Z',
    description: 'Password reset token expiry date'
  })
  @Exclude()
  @Column({ type: 'timestamptz', nullable: true })
  resetTokenExpiry?: Date | null;

  @ApiPropertyOptional({ 
    example: '2025-07-17T09:34:12.000Z',
    description: 'Last login timestamp'
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastLogin?: Date;

  @ApiPropertyOptional({ 
    example: '2025-07-31T23:59:59.000Z',
    description: 'Account expiry date'
  })
  @Column({ type: 'timestamptz', nullable: true })
  expiryDate?: Date;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of failed login attempts'
  })
  @Column({ default: 0 })
  failedLoginAttempts!: number;

  @ApiPropertyOptional({
    example: '2025-07-17T09:34:12.000Z',
    description: 'Account locked until this timestamp'
  })
  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil?: Date;

  @ApiPropertyOptional({
    example: 'email-verification-token',
    description: 'Email verification token'
  })
  @Exclude()
  @Column({ nullable: true, length: 255 })
  emailVerificationToken?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether email is verified'
  })
  @Column({ default: false })
  emailVerified!: boolean;

  @ApiPropertyOptional({
    example: '192.168.1.100',
    description: 'Last known IP address'
  })
  @Column({ nullable: true, length: 45 })
  lastIpAddress?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Tenant ID for multi-tenant applications'
  })
  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'User preferred language'
  })
  @Column({ length: 5, nullable: true, default: 'en' })
  preferredLanguage?: string;

  @ApiPropertyOptional({
    example: 'Africa/Nairobi',
    description: 'User timezone'
  })
  @Column({ length: 50, nullable: true, default: 'Africa/Nairobi' })
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Additional user metadata as JSON'
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ 
    example: '2025-07-01T10:23:45.123Z',
    description: 'Account creation timestamp'
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ 
    example: '2025-07-11T06:42:19.987Z',
    description: 'Last update timestamp'
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: '2025-07-15T14:22:33.456Z',
    description: 'Soft delete timestamp'
  })
  @Column({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // -------------------------------
  // Hooks
  // -------------------------------

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if password is being set/changed and isn't already hashed
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  setDefaults() {
    // Set default values
    if (this.emailVerified === undefined) {
      this.emailVerified = false;
    }
    if (this.failedLoginAttempts === undefined) {
      this.failedLoginAttempts = 0;
    }
    if (this.preferredLanguage === undefined) {
      this.preferredLanguage = 'en';
    }
    if (this.timezone === undefined) {
      this.timezone = 'Africa/Nairobi';
    }

    // Auto-populate firstName and lastName from fullName if they're not set
    if (this.fullName && (!this.firstName || !this.lastName)) {
      const nameParts = this.fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        this.firstName = nameParts[0];
        this.lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        this.firstName = nameParts[0];
        this.lastName = '';
      }
    }

    // Auto-populate fullName from firstName and lastName if fullName is not set
    if (!this.fullName && (this.firstName || this.lastName)) {
      this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }
  }

  // -------------------------------
  // Methods
  // -------------------------------

  async validatePassword(attempt: string): Promise<boolean> {
    if (!this.password || !attempt) {
      return false;
    }
    return bcrypt.compare(attempt, this.password);
  }

  isAccountLocked(): boolean {
    return this.lockedUntil ? new Date() < this.lockedUntil : false;
  }

  isAccountExpired(): boolean {
    return this.expiryDate ? new Date() > this.expiryDate : false;
  }

  canLogin(): boolean {
    return this.isActive && 
           !this.isAccountLocked() && 
           !this.isAccountExpired() &&
           this.emailVerified;
  }

  lockAccount(durationMinutes: number = 30): void {
    this.lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
  }

  unlockAccount(): void {
    this.lockedUntil = undefined;
    this.failedLoginAttempts = 0;
  }

  incrementFailedAttempts(): void {
    this.failedLoginAttempts += 1;
    
    // Progressive lockout: 5 attempts = 30 min, 10 attempts = 2 hours, 15+ = 1 day
    if (this.failedLoginAttempts >= 15) {
      this.lockAccount(24 * 60); // 1 day
    } else if (this.failedLoginAttempts >= 10) {
      this.lockAccount(2 * 60); // 2 hours
    } else if (this.failedLoginAttempts >= 5) {
      this.lockAccount(30); // 30 minutes
    }
  }

  resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
    this.email = `deleted_${Date.now()}_${this.email}`; // Preserve uniqueness
  }

  restore(): void {
    this.deletedAt = undefined;
    // Note: Don't automatically set isActive = true, let admin decide
  }

  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  getDisplayName(): string {
    return this.fullName || this.email || 'Unknown User';
  }

  // -------------------------------
  // Relationships
  // -------------------------------

  @ApiPropertyOptional({ 
    description: 'ISP ID (foreign key)'
  })
  @Column({ nullable: true, type: 'uuid' })
  ispId?: string;

  @ApiPropertyOptional({ 
    type: () => Isp,
    description: 'Associated ISP (if user is a client)'
  })
  @ManyToOne(() => Isp, (isp) => isp.users, {
    nullable: true,
    onDelete: 'SET NULL',
    lazy: false,
  })
  @JoinColumn({ name: 'ispId' })
  isp?: Isp;

  @ApiPropertyOptional({ 
    type: () => [Payment],
    description: 'User payments'
  })
  @OneToMany(() => Payment, (payment) => payment.user, {
    cascade: false,
    lazy: true,
  })
  payments!: Payment[];

  @ApiPropertyOptional({ 
    type: () => [Transaction],
    description: 'User transactions'
  })
  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: false,
    lazy: true,
  })
  transactions!: Transaction[];

  @ApiPropertyOptional({ 
    type: () => [Session],
    description: 'User sessions'
  })
  @OneToMany(() => Session, (session) => session.user, {
    cascade: false,
    lazy: true,
  })
  sessions!: Session[];

  @ApiPropertyOptional({ 
    type: () => [UsageLog],
    description: 'User usage logs'
  })
  @OneToMany(() => UsageLog, (log) => log.user, {
    cascade: false,
    lazy: true,
  })
  usageLogs!: UsageLog[];

  @ApiPropertyOptional({ 
    type: () => [HotspotProfile],
    description: 'Hotspot profiles created by this user'
  })
  @OneToMany(() => HotspotProfile, (profile) => profile.createdBy, {
    cascade: false,
    lazy: true,
  })
  createdHotspotProfiles!: HotspotProfile[];

  @ApiPropertyOptional({ 
    type: () => [PppoeProfile],
    description: 'PPPoE profiles created by this user'
  })
  @OneToMany(() => PppoeProfile, (profile) => profile.createdBy, {
    cascade: false,
    lazy: true,
  })
  createdPppoeProfiles!: PppoeProfile[];

  @ApiPropertyOptional({ 
    type: () => [Router],
    description: 'Routers created by this user'
  })
  @OneToMany(() => Router, (router) => router.createdBy, {
    cascade: false,
    lazy: true,
  })
  createdRouters!: Router[];

  @ApiPropertyOptional({ 
    type: () => [Alert],
    description: 'Alerts triggered by this user'
  })
  @OneToMany(() => Alert, (alert) => alert.triggeredBy, {
    cascade: false,
    lazy: true,
  })
  alerts!: Alert[];

  @ApiPropertyOptional({ 
    type: () => [AnalyticsReport],
    description: 'Analytics reports generated by this user'
  })
  @OneToMany(() => AnalyticsReport, (report) => report.generatedBy, {
    cascade: false,
    lazy: true,
  })
  generatedReports?: AnalyticsReport[];
}