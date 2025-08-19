import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Isp } from './isp.entity';

@Entity('isp_settings')
export class IspSettings {
  @ApiProperty({
    description: 'Unique identifier for ISP settings',
    example: 'uuid-here'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Enable hotspot functionality',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  enableHotspot: boolean;

  @ApiProperty({
    description: 'Enable PPPoE functionality',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  enablePPPoE: boolean;

  @ApiProperty({
    description: 'Require two-factor authentication',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  require2FA: boolean;

  @ApiProperty({
    description: 'Maximum concurrent sessions per user',
    example: 1
  })
  @Column({ type: 'int', default: 1 })
  maxConcurrentSessions: number;

  @ApiProperty({
    description: 'Session timeout in minutes',
    example: 60
  })
  @Column({ type: 'int', default: 60 })
  sessionTimeout: number;

  @ApiProperty({
    description: 'Enable usage logging',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  enableUsageLogging: boolean;

  @ApiProperty({
    description: 'Auto-suspend inactive clients (days)',
    example: 30,
    required: false
  })
  @Column({ type: 'int', nullable: true })
  autoSuspendAfterDays?: number;

  @ApiProperty({
    description: 'Email notifications enabled',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  emailNotificationsEnabled: boolean;

  @ApiProperty({
    description: 'SMS notifications enabled',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  smsNotificationsEnabled: boolean;

  @ApiProperty({
    description: 'Default client package ID',
    required: false
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultPackageId?: string;

  @ApiProperty({
    description: 'Custom portal URL',
    required: false
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  customPortalUrl?: string;

  @ApiProperty({
    description: 'Maintenance mode enabled',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  maintenanceMode: boolean;

  @ApiProperty({
    description: 'Maintenance message',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  maintenanceMessage?: string;

  @ApiProperty({
    description: 'Associated ISP'
  })
  @OneToOne(() => Isp, (isp) => isp.settings)
  @JoinColumn()
  isp: Isp;

  @ApiProperty({
    description: 'Creation timestamp'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  canCreateNewSession(currentSessions: number): boolean {
    return currentSessions < this.maxConcurrentSessions;
  }

  isMaintenanceActive(): boolean {
    return this.maintenanceMode;
  }

  shouldAutoSuspend(lastActiveDate: Date): boolean {
    if (!this.autoSuspendAfterDays) return false;
    
    const daysSinceLastActive = Math.floor(
      (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceLastActive >= this.autoSuspendAfterDays;
  }
}