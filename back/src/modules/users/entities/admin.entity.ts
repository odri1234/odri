import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from './user.entity';
import { UserRole } from '../constants/user-role.constants';

// Define permission types for better type safety
export interface AdminPermissions {
  users?: string[];
  reports?: string[];
  billing?: string[];
  monitoring?: string[];
  system?: string[];
  analytics?: string[];
  routers?: string[];
  profiles?: string[];
  isps?: string[];
}

export enum AdminLevel {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  SUPER = 'super',
}

@Entity('admins')
@Index(['userId'])
@Index(['isSuperAdmin'])
@Index(['adminLevel'])
@Index(['isActive'])
export class Admin {
  @ApiProperty({ 
    example: 'e52c9ad2-8639-4a70-8f23-3e6e0cb78b9c',
    description: 'Unique identifier for the admin'
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ 
    type: () => User,
    description: 'Associated user account'
  })
  @OneToOne(() => User, { 
    cascade: ['insert', 'update'], 
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Foreign key to user table'
  })
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @ApiProperty({ 
    example: false,
    description: 'Whether this admin has super admin privileges'
  })
  @Column({ default: false })
  isSuperAdmin!: boolean;

  @ApiPropertyOptional({
    enum: AdminLevel,
    example: AdminLevel.BASIC,
    description: 'Admin access level'
  })
  @Column({ 
    type: 'enum', 
    enum: AdminLevel, 
    default: AdminLevel.BASIC 
  })
  adminLevel!: AdminLevel;

  @ApiProperty({ 
    example: true,
    description: 'Whether the admin account is active'
  })
  @Column({ default: true })
  isActive!: boolean;

  @ApiPropertyOptional({
    example: {
      users: ['create', 'read', 'update', 'delete'],
      reports: ['read', 'export'],
      billing: ['read', 'update'],
      monitoring: ['read'],
      system: ['read'],
      analytics: ['read'],
      routers: ['create', 'read', 'update'],
      profiles: ['create', 'read', 'update'],
      isps: ['read']
    },
    description: 'Granular permissions for different system modules'
  })
  @Column({ type: 'jsonb', nullable: true })
  permissions?: AdminPermissions;

  @ApiPropertyOptional({
    example: ['dashboard', 'users', 'billing'],
    description: 'List of allowed dashboard sections'
  })
  @Column({ type: 'simple-array', nullable: true })
  allowedSections?: string[];

  @ApiPropertyOptional({
    example: '192.168.1.0/24',
    description: 'IP address restrictions (CIDR notation)'
  })
  @Column({ type: 'simple-array', nullable: true })
  ipRestrictions?: string[];

  @ApiPropertyOptional({
    example: '09:00-17:00',
    description: 'Time-based access restrictions'
  })
  @Column({ nullable: true, length: 100 })
  timeRestrictions?: string;

  @ApiPropertyOptional({
    example: 'MON,TUE,WED,THU,FRI',
    description: 'Day-based access restrictions'
  })
  @Column({ nullable: true, length: 50 })
  dayRestrictions?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59.000Z',
    description: 'Admin access expiry date'
  })
  @Column({ type: 'timestamptz', nullable: true })
  accessExpiresAt?: Date;

  @ApiPropertyOptional({
    example: '2025-07-17T09:34:12.000Z',
    description: 'Last admin action timestamp'
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastAdminAction?: Date;

  @ApiPropertyOptional({
    example: '192.168.1.100',
    description: 'Last IP address used for admin actions'
  })
  @Column({ nullable: true, length: 45 })
  lastAdminIp?: string;

  @ApiPropertyOptional({
    example: 150,
    description: 'Total number of admin actions performed'
  })
  @Column({ default: 0 })
  totalAdminActions!: number;

  @ApiPropertyOptional({
    description: 'Additional admin-specific metadata'
  })
  @Column({ type: 'jsonb', nullable: true })
  adminMetadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Created by system administrator',
    description: 'Notes about this admin account'
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ 
    example: '2025-07-20T10:00:00.000Z',
    description: 'Admin account creation timestamp'
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({ 
    example: '2025-07-20T12:30:00.000Z',
    description: 'Last update timestamp'
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'ID of admin who created this account'
  })
  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  // -------------------------------
  // Constructor
  // -------------------------------

  constructor() {
    this.isActive = true;
    this.isSuperAdmin = false;
    this.adminLevel = AdminLevel.BASIC;
    this.totalAdminActions = 0;
  }

  // -------------------------------
  // Hooks
  // -------------------------------

  @BeforeInsert()
  @BeforeUpdate()
  validateAdminLevel() {
    // Auto-set admin level based on permissions
    if (this.isSuperAdmin) {
      this.adminLevel = AdminLevel.SUPER;
    } else if (this.permissions && Object.keys(this.permissions).length > 3) {
      this.adminLevel = AdminLevel.ADVANCED;
    } else {
      this.adminLevel = AdminLevel.BASIC;
    }
  }

  @BeforeInsert()
  setDefaults() {
    if (this.totalAdminActions === undefined) {
      this.totalAdminActions = 0;
    }
    if (this.isActive === undefined) {
      this.isActive = true;
    }
    if (this.isSuperAdmin === undefined) {
      this.isSuperAdmin = false;
    }
    if (this.adminLevel === undefined) {
      this.adminLevel = AdminLevel.BASIC;
    }
  }

  // -------------------------------
  // Static Factory Methods
  // -------------------------------

  static create(data: Partial<Admin>): Admin {
    const admin = new Admin();
    Object.assign(admin, data);
    return admin;
  }

  static createBasicAdmin(user: User): Admin {
    const admin = new Admin();
    admin.user = user;
    admin.userId = user.id;
    admin.adminLevel = AdminLevel.BASIC;
    admin.permissions = {
      users: ['read'],
      reports: ['read'],
    };
    return admin;
  }

  static createSuperAdmin(user: User): Admin {
    const admin = new Admin();
    admin.user = user;
    admin.userId = user.id;
    admin.grantFullAccess();
    return admin;
  }

  // -------------------------------
  // Permission Methods
  // -------------------------------

  hasPermission(module: keyof AdminPermissions, action: string): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (!this.permissions || !this.permissions[module]) {
      return false;
    }

    return this.permissions[module]?.includes(action) || false;
  }

  canAccessSection(section: string): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    if (!this.allowedSections) {
      return true; // If no restrictions, allow all
    }

    return this.allowedSections.includes(section);
  }

  addPermission(module: keyof AdminPermissions, action: string): void {
    if (!this.permissions) {
      this.permissions = {};
    }
    if (!this.permissions[module]) {
      this.permissions[module] = [];
    }
    if (!this.permissions[module]?.includes(action)) {
      this.permissions[module]?.push(action);
    }
  }

  removePermission(module: keyof AdminPermissions, action: string): void {
    if (this.permissions && this.permissions[module]) {
      this.permissions[module] = this.permissions[module]?.filter(a => a !== action);
      if (this.permissions[module]?.length === 0) {
        delete this.permissions[module];
      }
    }
  }

  grantFullAccess(): void {
    this.isSuperAdmin = true;
    this.adminLevel = AdminLevel.SUPER;
    this.permissions = {
      users: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete', 'export'],
      billing: ['create', 'read', 'update', 'delete'],
      monitoring: ['create', 'read', 'update', 'delete'],
      system: ['create', 'read', 'update', 'delete'],
      analytics: ['create', 'read', 'update', 'delete'],
      routers: ['create', 'read', 'update', 'delete'],
      profiles: ['create', 'read', 'update', 'delete'],
      isps: ['create', 'read', 'update', 'delete'],
    };
  }

  revokeAllPermissions(): void {
    this.isSuperAdmin = false;
    this.adminLevel = AdminLevel.BASIC;
    this.permissions = {};
    this.allowedSections = [];
  }

  setPermissions(permissions: AdminPermissions): void {
    this.permissions = permissions;
  }

  getPermissionSummary(): { modules: number; actions: number; level: string } {
    const modules = this.permissions ? Object.keys(this.permissions).length : 0;
    const actions = this.permissions ? 
      Object.values(this.permissions).reduce((total, perms) => total + (perms?.length || 0), 0) : 0;
    
    return {
      modules,
      actions,
      level: this.adminLevel,
    };
  }

  // -------------------------------
  // Access Control Methods
  // -------------------------------

  isAccessExpired(): boolean {
    return this.accessExpiresAt ? new Date() > this.accessExpiresAt : false;
  }

  isWithinTimeRestrictions(): boolean {
    if (!this.timeRestrictions) {
      return true;
    }

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    const [startTime, endTime] = this.timeRestrictions.split('-');
    return currentTime >= startTime && currentTime <= endTime;
  }

  isWithinDayRestrictions(): boolean {
    if (!this.dayRestrictions) {
      return true;
    }

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = days[new Date().getDay()];
    
    return this.dayRestrictions.split(',').includes(today);
  }

  isIpAllowed(ip: string): boolean {
    if (!this.ipRestrictions || this.ipRestrictions.length === 0) {
      return true;
    }

    // Simple IP check - in production, use a proper CIDR library
    return this.ipRestrictions.some(restriction => {
      if (restriction.includes('/')) {
        // CIDR notation - simplified check
        const [network] = restriction.split('/');
        return ip.startsWith(network.substring(0, network.lastIndexOf('.')));
      } else {
        // Exact IP match
        return ip === restriction;
      }
    });
  }

  canPerformAdminAction(ip?: string): boolean {
    return this.isActive && 
           !this.isAccessExpired() && 
           this.isWithinTimeRestrictions() && 
           this.isWithinDayRestrictions() &&
           (ip ? this.isIpAllowed(ip) : true);
  }

  recordAdminAction(ip?: string): void {
    this.lastAdminAction = new Date();
    this.totalAdminActions += 1;
    if (ip) {
      this.lastAdminIp = ip;
    }
  }

  // -------------------------------
  // Restriction Management
  // -------------------------------

  setTimeRestrictions(startTime: string, endTime: string): void {
    this.timeRestrictions = `${startTime}-${endTime}`;
  }

  setDayRestrictions(days: string[]): void {
    this.dayRestrictions = days.join(',');
  }

  addIpRestriction(ip: string): void {
    if (!this.ipRestrictions) {
      this.ipRestrictions = [];
    }
    if (!this.ipRestrictions.includes(ip)) {
      this.ipRestrictions.push(ip);
    }
  }

  removeIpRestriction(ip: string): void {
    if (this.ipRestrictions) {
      this.ipRestrictions = this.ipRestrictions.filter(restriction => restriction !== ip);
    }
  }

  clearAllRestrictions(): void {
    this.timeRestrictions = undefined;
    this.dayRestrictions = undefined;
    this.ipRestrictions = undefined;
    this.accessExpiresAt = undefined;
  }

  setAccessExpiry(date: Date): void {
    this.accessExpiresAt = date;
  }

  extendAccess(days: number): void {
    const currentExpiry = this.accessExpiresAt || new Date();
    this.accessExpiresAt = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
  }

  // -------------------------------
  // Utility Methods
  // -------------------------------

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  promoteToSuperAdmin(): void {
    this.grantFullAccess();
  }

  demoteFromSuperAdmin(): void {
    this.isSuperAdmin = false;
    this.adminLevel = AdminLevel.BASIC;
    this.permissions = {
      users: ['read'],
      reports: ['read'],
    };
  }

  getSecurityStatus(): {
    isSecure: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    if (!this.isActive) {
      issues.push('Admin account is inactive');
      score -= 50;
    }

    if (this.isAccessExpired()) {
      issues.push('Admin access has expired');
      score -= 30;
    }

    if (this.isSuperAdmin && (!this.ipRestrictions || this.ipRestrictions.length === 0)) {
      issues.push('Super admin without IP restrictions');
      score -= 20;
    }

    if (!this.lastAdminAction || 
        (new Date().getTime() - this.lastAdminAction.getTime()) > 30 * 24 * 60 * 60 * 1000) {
      issues.push('No recent admin activity (30+ days)');
      score -= 10;
    }

    return {
      isSecure: issues.length === 0,
      issues,
      score: Math.max(0, score),
    };
  }

  // -------------------------------
  // String Representation
  // -------------------------------

  toString(): string {
    return `Admin(${this.user?.fullName || 'Unknown'} - ${this.adminLevel})`;
  }

  toJSON(): Partial<Admin> {
    const {
      id, userId, isSuperAdmin, adminLevel, isActive,
      permissions, allowedSections, totalAdminActions,
      lastAdminAction, createdAt, updatedAt
    } = this;

    return {
      id, userId, isSuperAdmin, adminLevel, isActive,
      permissions, allowedSections, totalAdminActions,
      lastAdminAction, createdAt, updatedAt
    };
  }
}