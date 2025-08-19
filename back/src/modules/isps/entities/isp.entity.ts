import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from '../../users/entities/user.entity';
import { IspSettings } from './isp-settings.entity';
import { IspBranding } from './isp-branding.entity';
import { Client } from '../../users/entities/client.entity';
import { AnalyticsReport } from '../../analytics/entities/analytics-report.entity';
import { Router } from '../../mikrotik/entities/router.entity';
import { HotspotProfile } from '../../mikrotik/entities/hotspot-profile.entity';
import { PppoeProfile } from '../../mikrotik/entities/pppoe-profile.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Transaction } from '../../payments/entities/transaction.entity';
import { VoucherBatch } from '../../vouchers/entities/voucher-batch.entity';
import { RevenueMetric } from '../../analytics/entities/revenue-metric.entity';
import { UsageMetric } from '../../metrics/entities/usage-metric.entity';
import { Alert } from '../../monitoring/entities/alert.entity';
import { HealthCheck } from '../../monitoring/entities/health-check.entity';
import { SystemMetric } from '../../monitoring/entities/system-metric.entity';

// Define ISP-specific types for better type safety
export interface IspMetadata {
  businessInfo?: {
    registrationNumber: string;
    taxNumber: string;
    licenseNumber: string;
    industry: string;
  };
  financialInfo?: {
    bankAccount: string;
    paymentMethods: string[];
    currency: string;
    timezone: string;
  };
  technicalInfo?: {
    defaultBandwidth: string;
    maxClients: number;
    supportedProtocols: string[];
  };
  contactInfo?: {
    supportEmail: string;
    billingEmail: string;
    technicalEmail: string;
    emergencyPhone: string;
  };
  // Add missing suspension reason property
  suspensionReason?: string;
  // Allow for additional dynamic properties
  [key: string]: any;
}

export enum IspStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval',
  TRIAL = 'trial',
}

export enum IspTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  PREMIUM = 'premium',
}

@Entity('isps')
@Index(['name'])
@Index(['code'])
@Index(['status'])
@Index(['isActive'])
@Index(['tier'])
@Index(['ownerId'])
@Index(['createdAt'])
export class Isp {
  @ApiProperty({ 
    example: '5f6a8e53-9f4e-4c7f-89a2-123456789abc',
    description: 'Unique identifier for the ISP'
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ 
    example: 'TechNet Ltd.',
    description: 'ISP business name (unique)'
  })
  @Column({ unique: true, length: 255 })
  name!: string;

  @ApiProperty({ 
    example: 'TNET01',
    description: 'ISP unique code identifier'
  })
  @Column({ unique: true, length: 20 })
  code!: string;

  @ApiPropertyOptional({ 
    example: 'support@technet.com',
    description: 'Primary ISP email address'
  })
  @Column({ nullable: true, length: 255 })
  email?: string;

  @ApiPropertyOptional({ 
    example: '+254712345678',
    description: 'Primary ISP phone number'
  })
  @Column({ nullable: true, length: 20 })
  phone?: string;

  @ApiPropertyOptional({ 
    example: '123 Tech Street, Nairobi, Kenya',
    description: 'ISP business address'
  })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiPropertyOptional({ 
    example: 'https://technet.com',
    description: 'ISP website URL'
  })
  @Column({ nullable: true, length: 255 })
  website?: string;

  @ApiPropertyOptional({
    example: 'Leading internet service provider in Kenya',
    description: 'ISP description/about'
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({
    enum: IspStatus,
    example: IspStatus.ACTIVE,
    description: 'Current ISP status'
  })
  @Column({ 
    type: 'enum', 
    enum: IspStatus, 
    default: IspStatus.PENDING_APPROVAL 
  })
  status!: IspStatus;

  @ApiProperty({ 
    example: true,
    description: 'Whether the ISP is active'
  })
  @Column({ default: true })
  isActive!: boolean;

  @ApiPropertyOptional({
    enum: IspTier,
    example: IspTier.PROFESSIONAL,
    description: 'ISP service tier/plan'
  })
  @Column({ 
    type: 'enum', 
    enum: IspTier, 
    default: IspTier.BASIC 
  })
  tier!: IspTier;

  @ApiPropertyOptional({
    example: 'ISP001',
    description: 'Business registration number'
  })
  @Column({ nullable: true, length: 50 })
  registrationNumber?: string;

  @ApiPropertyOptional({
    example: 'TAX123456789',
    description: 'Tax identification number'
  })
  @Column({ nullable: true, length: 50 })
  taxNumber?: string;

  @ApiPropertyOptional({
    example: 'LIC789012345',
    description: 'ISP license number'
  })
  @Column({ nullable: true, length: 50 })
  licenseNumber?: string;

  @ApiPropertyOptional({
    example: 'KES',
    description: 'Default currency for billing'
  })
  @Column({ length: 3, default: 'KES' })
  currency!: string;

  @ApiPropertyOptional({
    example: 'Africa/Nairobi',
    description: 'ISP timezone'
  })
  @Column({ nullable: true, length: 50 })
  timezone?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum number of clients allowed'
  })
  @Column({ type: 'int', default: 100 })
  maxClients!: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Current number of active clients'
  })
  @Column({ type: 'int', default: 0 })
  currentClients!: number;

  @ApiPropertyOptional({
    example: 50000.00,
    description: 'Monthly revenue'
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  monthlyRevenue!: number;

  @ApiPropertyOptional({
    example: 25000.00,
    description: 'Outstanding receivables'
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingReceivables!: number;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59.000Z',
    description: 'ISP subscription/license expiry date'
  })
  @Column({ type: 'timestamptz', nullable: true })
  expiryDate?: Date;

  @ApiPropertyOptional({
    example: '2025-07-20T09:00:00.000Z',
    description: 'Last time ISP was active/logged in'
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastActivityAt?: Date;

  @ApiPropertyOptional({
    example: 'https://api.technet.com/webhooks',
    description: 'Webhook URL for notifications'
  })
  @Column({ nullable: true, length: 255 })
  webhookUrl?: string;

  @ApiPropertyOptional({
    example: 'webhook-secret-key-123',
    description: 'Webhook secret for verification'
  })
  @Column({ nullable: true, length: 255 })
  webhookSecret?: string;

  @ApiPropertyOptional({
    example: 'api-key-12345',
    description: 'API key for external integrations'
  })
  @Column({ nullable: true, length: 255 })
  apiKey?: string;

  @ApiPropertyOptional({
    example: {
      businessInfo: {
        registrationNumber: 'REG123456',
        taxNumber: 'TAX789012',
        licenseNumber: 'LIC345678',
        industry: 'Telecommunications'
      },
      financialInfo: {
        bankAccount: 'ACC-123456789',
        paymentMethods: ['mpesa', 'bank_transfer', 'cash'],
        currency: 'KES',
        timezone: 'Africa/Nairobi'
      },
      technicalInfo: {
        defaultBandwidth: '5Mbps',
        maxClients: 1000,
        supportedProtocols: ['hotspot', 'pppoe', 'static']
      }
    },
    description: 'Additional ISP metadata'
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: IspMetadata;

  @ApiPropertyOptional({
    example: 'Premium ISP with excellent service record',
    description: 'Internal notes about the ISP'
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ 
    example: '2025-07-18T08:00:00.000Z',
    description: 'ISP creation timestamp'
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ 
    example: '2025-07-20T13:45:00.000Z',
    description: 'Last update timestamp'
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'ID of admin who created this ISP'
  })
  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  // -------------------------------
  // Relationships
  // -------------------------------

  @ApiProperty({ 
    type: () => User,
    description: 'ISP owner/administrator'
  })
  @OneToOne(() => User, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Foreign key to owner user'
  })
  @Column({ type: 'uuid', unique: true })
  ownerId!: string;

  @ApiPropertyOptional({ 
    type: () => [User],
    description: 'Users associated with this ISP'
  })
  @OneToMany(() => User, (user) => user.isp, {
    cascade: false,
    lazy: true,
  })
  users!: User[];

  @ApiProperty({ 
    type: () => [Client],
    description: 'ISP clients'
  })
  @OneToMany(() => Client, (client) => client.isp, {
    cascade: ['insert', 'update'],
    lazy: true,
  })
  clients!: Client[];

  @OneToMany(() => RevenueMetric, (metric) => metric.isp)
  revenueMetrics!: RevenueMetric[];

  @OneToMany(() => UsageMetric, (usageMetric) => usageMetric.isp)
  usageMetrics!: UsageMetric[];

  @OneToMany(() => VoucherBatch, (batch) => batch.isp)
  voucherBatches?: VoucherBatch[];

  @OneToMany(() => Alert, (alert) => alert.isp)
  alerts?: Alert[];

  @OneToMany(() => HealthCheck, (healthCheck) => healthCheck.isp)
  healthChecks?: HealthCheck[];

  @OneToMany(() => SystemMetric, (metric) => metric.isp)
  systemMetrics?: SystemMetric[];

  @ApiProperty({ 
    type: () => IspSettings,
    description: 'ISP configuration settings'
  })
  @OneToOne(() => IspSettings, (settings) => settings.isp, { 
    cascade: ['insert', 'update', 'remove'], 
    eager: false,
  })
  settings!: IspSettings;

  @ApiProperty({ 
    type: () => IspBranding,
    description: 'ISP branding configuration'
  })
  @OneToOne(() => IspBranding, (branding) => branding.isp, { 
    cascade: ['insert', 'update', 'remove'], 
    eager: false,
  })
  branding!: IspBranding;

  @ApiPropertyOptional({ 
    type: () => [Router],
    description: 'ISP routers'
  })
  @OneToMany(() => Router, (router) => router.isp, {
    cascade: false,
    lazy: true,
  })
  routers!: Router[];

  @ApiPropertyOptional({ 
    type: () => [HotspotProfile],
    description: 'ISP hotspot profiles'
  })
  @OneToMany(() => HotspotProfile, (profile) => profile.isp, {
    cascade: false,
    lazy: true,
  })
  hotspotProfiles!: HotspotProfile[];

  @ApiPropertyOptional({ 
    type: () => [PppoeProfile],
    description: 'ISP PPPoE profiles'
  })
  @OneToMany(() => PppoeProfile, (profile) => profile.isp, {
    cascade: false,
    lazy: true,
  })
  pppoeProfiles!: PppoeProfile[];

  @ApiPropertyOptional({ 
    type: () => [Payment],
    description: 'ISP payments received'
  })
  @OneToMany(() => Payment, (payment) => payment.isp, {
    cascade: false,
    lazy: true,
  })
  payments!: Payment[];

  @ApiPropertyOptional({ 
    type: () => [Transaction],
    description: 'ISP financial transactions'
  })
  @OneToMany(() => Transaction, (transaction) => transaction.isp, {
    cascade: false,
    lazy: true,
  })
  transactions!: Transaction[];

  @ApiPropertyOptional({ 
    type: () => [AnalyticsReport],
    description: 'ISP analytics reports'
  })
  @OneToMany(() => AnalyticsReport, (report) => report.isp, {
    cascade: false,
    lazy: true,
  })
  analyticsReports?: AnalyticsReport[];

  // -------------------------------
  // Constructor - Initialize all properties
  // -------------------------------

  constructor() {
    // Initialize primitive properties with defaults
    this.isActive = true;
    this.status = IspStatus.PENDING_APPROVAL;
    this.tier = IspTier.BASIC;
    this.currency = 'KES';
    this.maxClients = 100;
    this.currentClients = 0;
    this.monthlyRevenue = 0;
    this.outstandingReceivables = 0;
  }

  // -------------------------------
  // Hooks
  // -------------------------------

  @BeforeInsert()
  @BeforeUpdate()
  updateStatus() {
    // Auto-update status based on conditions
    if (!this.isActive) {
      this.status = IspStatus.INACTIVE;
    } else if (this.isExpired()) {
      this.status = IspStatus.SUSPENDED;
    } else if (this.currentClients >= this.maxClients) {
      // Could implement logic for handling max client limits
      // For now, just log a warning
      console.warn(`ISP ${this.name} has reached maximum client capacity`);
    }
  }

  @BeforeInsert()
  setDefaults() {
    if (!this.code) {
      // Generate ISP code from name if not provided
      this.code = this.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    }
    
    // Ensure all numeric defaults are set
    if (this.currency === undefined) {
      this.currency = 'KES';
    }
    if (this.maxClients === undefined) {
      this.maxClients = 100;
    }
    if (this.currentClients === undefined) {
      this.currentClients = 0;
    }
    if (this.monthlyRevenue === undefined) {
      this.monthlyRevenue = 0;
    }
    if (this.outstandingReceivables === undefined) {
      this.outstandingReceivables = 0;
    }
    
    // Initialize metadata if not set
    if (!this.metadata) {
      this.metadata = {};
    }
  }

  @BeforeUpdate()
  updateActivity() {
    this.lastActivityAt = new Date();
  }

  // -------------------------------
  // Static Factory Methods
  // -------------------------------

  static create(data: Partial<Isp>): Isp {
    const isp = new Isp();
    Object.assign(isp, data);
    return isp;
  }

  static createWithDefaults(name: string, owner: User): Isp {
    const isp = new Isp();
    isp.name = name;
    isp.owner = owner;
    isp.ownerId = owner.id;
    isp.email = owner.email;
    isp.phone = owner.phone;
    return isp;
  }

  // -------------------------------
  // Core Business Logic Methods
  // -------------------------------

  isExpired(): boolean {
    return this.expiryDate ? new Date() > this.expiryDate : false;
  }

  canAddClient(): boolean {
    return this.isActive && 
           !this.isExpired() && 
           this.currentClients < this.maxClients &&
           this.status === IspStatus.ACTIVE;
  }

  getClientCapacityPercentage(): number {
    return this.maxClients > 0 ? (this.currentClients / this.maxClients) * 100 : 0;
  }

  incrementClientCount(): void {
    this.currentClients += 1;
  }

  decrementClientCount(): void {
    this.currentClients = Math.max(0, this.currentClients - 1);
  }

  addRevenue(amount: number): void {
    if (amount > 0) {
      this.monthlyRevenue += amount;
    }
  }

  addReceivable(amount: number): void {
    if (amount > 0) {
      this.outstandingReceivables += amount;
    }
  }

  collectReceivable(amount: number): boolean {
    if (amount > 0 && this.outstandingReceivables >= amount) {
      this.outstandingReceivables -= amount;
      this.addRevenue(amount);
      return true;
    }
    return false;
  }

  suspend(reason?: string): void {
    this.isActive = false;
    this.status = IspStatus.SUSPENDED;
    if (reason) {
      if (!this.metadata) {
        this.metadata = {};
      }
      this.metadata.suspensionReason = reason;
    }
  }

  activate(): void {
    this.isActive = true;
    this.status = IspStatus.ACTIVE;
    if (this.metadata?.suspensionReason) {
      delete this.metadata.suspensionReason;
    }
  }

  extendLicense(days: number): void {
    if (days > 0) {
      const currentExpiry = this.expiryDate || new Date();
      this.expiryDate = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
    }
  }

  upgradeTier(newTier: IspTier): void {
    this.tier = newTier;
    
    // Adjust limits based on tier
    switch (newTier) {
      case IspTier.BASIC:
        this.maxClients = 100;
        break;
      case IspTier.PROFESSIONAL:
        this.maxClients = 500;
        break;
      case IspTier.ENTERPRISE:
        this.maxClients = 2000;
        break;
      case IspTier.PREMIUM:
        this.maxClients = 10000;
        break;
    }
  }

  generateApiKey(): string {
    const key = 'isp_' + Math.random().toString(36).substr(2, 9) + 
                Date.now().toString(36);
    this.apiKey = key;
    return key;
  }

  resetApiKey(): void {
    this.apiKey = undefined;
  }

  updateWebhook(url: string, secret?: string): void {
    this.webhookUrl = url;
    if (secret) {
      this.webhookSecret = secret;
    }
  }

  clearWebhook(): void {
    this.webhookUrl = undefined;
    this.webhookSecret = undefined;
  }

  // -------------------------------
  // Metadata Management Methods
  // -------------------------------

  updateMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  clearMetadata(key: string): void {
    if (this.metadata && this.metadata[key] !== undefined) {
      delete this.metadata[key];
    }
  }

  setBusinessInfo(info: IspMetadata['businessInfo']): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.businessInfo = info;
  }

  setFinancialInfo(info: IspMetadata['financialInfo']): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.financialInfo = info;
  }

  setTechnicalInfo(info: IspMetadata['technicalInfo']): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.technicalInfo = info;
  }

  setContactInfo(info: IspMetadata['contactInfo']): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.contactInfo = info;
  }

  // -------------------------------
  // Reporting and Analytics Methods
  // -------------------------------

  getFinancialSummary(): {
    revenue: number;
    receivables: number;
    clients: number;
    capacity: number;
    tier: string;
    status: string;
  } {
    return {
      revenue: Number(this.monthlyRevenue),
      receivables: Number(this.outstandingReceivables),
      clients: this.currentClients,
      capacity: this.getClientCapacityPercentage(),
      tier: this.tier,
      status: this.status,
    };
  }

  getHealthStatus(): {
    isHealthy: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    if (!this.isActive) {
      issues.push('ISP is not active');
      score -= 50;
    }

    if (this.isExpired()) {
      issues.push('License has expired');
      score -= 30;
    }

    if (this.getClientCapacityPercentage() > 90) {
      issues.push('Near client capacity limit');
      score -= 10;
    }

    if (this.outstandingReceivables > this.monthlyRevenue * 2) {
      issues.push('High outstanding receivables');
      score -= 10;
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      score: Math.max(0, score),
    };
  }

  // -------------------------------
  // Validation Methods
  // -------------------------------

  isValidForActivation(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('ISP name is required');
    }

    if (!this.owner || !this.ownerId) {
      errors.push('ISP owner is required');
    }

    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Valid email address is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  canPerformAction(action: string): boolean {
    if (!this.isActive || this.isExpired()) {
      return false;
    }

    switch (action) {
      case 'add_client':
        return this.canAddClient();
      case 'process_payment':
        return this.status === IspStatus.ACTIVE;
      case 'manage_settings':
        return this.status === IspStatus.ACTIVE || this.status === IspStatus.TRIAL;
      default:
        return this.status === IspStatus.ACTIVE;
    }
  }

  // -------------------------------
  // String Representation
  // -------------------------------

  toString(): string {
    return `ISP(${this.name} - ${this.code})`;
  }

  toJSON(): Partial<Isp> {
    // Return a clean object for JSON serialization
    const {
      id, name, code, email, phone, address, website, description,
      status, isActive, tier, currency, timezone, maxClients,
      currentClients, monthlyRevenue, outstandingReceivables,
      createdAt, updatedAt
    } = this;

    return {
      id, name, code, email, phone, address, website, description,
      status, isActive, tier, currency, timezone, maxClients,
      currentClients, monthlyRevenue, outstandingReceivables,
      createdAt, updatedAt
    };
  }
}