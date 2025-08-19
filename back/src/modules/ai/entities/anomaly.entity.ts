import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AnomalyType, AnomalySeverity } from '../constants/anomaly.constants';

@Entity({ name: 'ai_anomalies' })
export class Anomaly {
  @ApiProperty({ example: 'd7d0dcb2-d7b2-4b5a-8c79-83dc6a1c389e' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    enum: AnomalyType,
    example: AnomalyType.UNUSUAL_USAGE,
    description: 'Type of anomaly detected',
  })
  @Column({ type: 'enum', enum: AnomalyType })
  type!: AnomalyType;

  @ApiProperty({
    enum: AnomalySeverity,
    example: AnomalySeverity.HIGH,
    default: AnomalySeverity.MEDIUM,
  })
  @Column({
    type: 'enum',
    enum: AnomalySeverity,
    default: AnomalySeverity.MEDIUM,
  })
  severity!: AnomalySeverity;

  @ApiProperty({
    example: 'User logged in from two different countries within 30 seconds.',
  })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({ example: 'client', enum: ['client', 'admin', 'router'] })
  @Column()
  actorType!: 'client' | 'admin' | 'router';

  @ApiProperty({ example: '73dfd432-3b11-412f-8801-41bfa5c8e90c' })
  @Index()
  @Column()
  actorId!: string;

  @ApiProperty({ example: 'ISP-23', required: false })
  @Column({ nullable: true })
  ispId?: string;

  @ApiProperty({ example: 'auto', enum: ['auto', 'manual'] })
  @Column({ default: 'auto' })
  detectedBy!: 'auto' | 'manual';

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
  })
  @Column({ default: 'pending' })
  status!: 'pending' | 'investigating' | 'resolved' | 'dismissed';

  @ApiProperty({ example: '2025-07-11T08:30:00.000Z' })
  @CreateDateColumn({ name: 'detected_at' })
  detectedAt!: Date;

  @ApiProperty({ example: '2025-07-11T09:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  resolved!: boolean;

  @ApiProperty({
    example: '2025-07-19T15:45:00.000Z',
    required: false,
    description: 'Timestamp when the anomaly was resolved',
  })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @ApiProperty({
    example: '41d1dcb2-ec91-4c49-9d2d-3de0f8771a65',
    required: false,
    description: 'Optional session ID related to the anomaly',
  })
  @Column({ type: 'varchar', nullable: true })
  sessionId?: string;
}
