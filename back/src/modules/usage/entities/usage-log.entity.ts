import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../users/entities/user.entity';
import { Client } from '../../users/entities/client.entity';

@Entity('usage_logs')
export class UsageLog {
  @ApiProperty({ example: 'd7d0dcb2-d7b2-4b5a-8c79-83dc6a1c389e' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user-uuid', description: 'Linked user ID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'client-uuid', required: false, description: 'Linked client ID (if any)' })
  @Column({ type: 'uuid', nullable: true })
  clientId?: string;

  @ApiProperty({ example: 'router-uuid', required: false, description: 'Linked router ID (if available)' })
  @Column({ type: 'uuid', nullable: true })
  routerId?: string;

  @ApiProperty({ example: 1024.5, description: 'Amount of data used (in MB or GB)' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  dataUsed: number;

  @ApiProperty({
    example: '2025-07-19T15:30:00.000Z',
    description: 'Exact time when usage was recorded',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ApiProperty({ example: '192.168.0.101', required: false, description: 'User device IP address' })
  @Column({ type: 'varchar', length: 45, nullable: true }) // supports IPv6 too
  ipAddress?: string;

  @ApiProperty({ example: 'session-uuid', required: false, description: 'Session ID this usage belongs to' })
  @Column({ type: 'uuid', nullable: true })
  sessionId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  /** 
   * Relationship: UsageLog → User (Many-to-One)
   * Deleting the user deletes related usage logs (CASCADE)
   */
  @ManyToOne(() => User, (user) => user.usageLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Relationship: UsageLog → Client (Many-to-One, optional)
   * When the client is deleted, this link is nulled (SET NULL)
   */
  @ManyToOne(() => Client, (client) => client.usageLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'clientId' })
  client?: Client;
}
