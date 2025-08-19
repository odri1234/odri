import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AiModel } from './ai-model.entity';

/**
 * Interface representing structured prediction results.
 */
export interface PredictionResult {
  peakHour?: number;
  offPeakHour?: number;
  [key: string]: any; // allow flexibility for other result shapes
}

/**
 * Enum representing types of AI predictions.
 */
export enum PredictionType {
  BANDWIDTH_FORECAST = 'BANDWIDTH_FORECAST',
  DEMAND_PREDICTION = 'DEMAND_PREDICTION',
  USAGE_FORECAST = 'USAGE_FORECAST',
  REVENUE_PREDICTION = 'REVENUE_PREDICTION',
  DEVICE_FAILURE = 'DEVICE_FAILURE',
  MAINTENANCE_SCHEDULE = 'MAINTENANCE_SCHEDULE',
  NETWORK_ANOMALY = 'NETWORK_ANOMALY',
  CUSTOMER_CHURN = 'CUSTOMER_CHURN',
}

@Entity({ name: 'ai_predictions' })
export class Prediction {
  @ApiProperty({ example: 'cf4b9f89-daaa-4db4-bce9-3e3d964716d5' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    enum: PredictionType,
    example: PredictionType.BANDWIDTH_FORECAST,
    description: 'Type of AI prediction.',
  })
  @Column({
    type: 'enum',
    enum: PredictionType,
  })
  type!: PredictionType;

  @ApiProperty({
    example: 'ISP-123',
    required: false,
    description: 'Reference ID associated with the prediction context.',
  })
  @Index()
  @Column({ type: 'varchar', nullable: true })  // <-- explicitly set type here
  referenceId?: string | null;
  
  @ApiProperty({
    example: 'device',
    required: false,
    description: 'Type of reference (device, router, etc.)',
  })
  @Column({ type: 'varchar', nullable: true })
  referenceType?: string | null;
  
  @ApiProperty({
    example: 'isp-123',
    required: false,
    description: 'ISP ID associated with this prediction',
  })
  @Column({ type: 'varchar', nullable: true })
  ispId?: string | null;

  @ApiProperty({
    example: { peakHour: 100, offPeakHour: 50 },
    description: 'Prediction results as structured JSON.',
  })
  @Column({ type: 'jsonb' })
  result!: PredictionResult;

  @ApiProperty({
    example: 125.75,
    description: 'Numerical value of the prediction result.',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  value!: number;

  @ApiProperty({
    example: 'Predicting usage during peak hours',
    description: 'Optional context for the prediction.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  context?: string;

  @ApiProperty({
    example: 'mbps',
    description: 'Unit of the prediction result (e.g., Mbps, users).',
  })
  @Column({ default: 'units' })
  unit!: string;

  @ApiProperty({
    example: 'demand_predictor_v3',
    description: 'Name or identifier of the model used for prediction.',
    required: false,
  })
  @Column({ nullable: true })
  modelUsed?: string;

  @ApiProperty({
    example: '2025-08-01T00:00:00.000Z',
    description: 'Target date for the prediction.',
  })
  @Column({ type: 'timestamptz' })
  targetDate!: Date;

  @ApiProperty({
    example: '2025-07-11T08:15:00.000Z',
    description:
      'Timestamp when the prediction was generated. Automatically set on creation.',
  })
  @CreateDateColumn({ name: 'detected_at', type: 'timestamptz' })
  detectedAt!: Date;

  @ApiProperty({
    example: '2025-07-11T08:30:00.000Z',
    description: 'Last update timestamp for this prediction record.',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ApiProperty({ type: () => AiModel, description: 'Associated AI model.' })
  @ManyToOne(() => AiModel, (model) => model.predictions, {
    onDelete: 'SET NULL',
    eager: true, // eager loading for convenience
    nullable: true,
  })
  model?: AiModel;
}
