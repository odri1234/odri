import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Prediction } from './prediction.entity';

// ✅ Add and export ModelType type or enum
export type ModelType = 'machine_learning' | 'deep_learning' | 'neural_network' | 'other';

// Optional: you could use an enum instead if preferred
// export enum ModelType {
//   MACHINE_LEARNING = 'machine_learning',
//   DEEP_LEARNING = 'deep_learning',
//   NEURAL_NETWORK = 'neural_network',
//   OTHER = 'other'
// }

@Entity('ai_models')
@Index(['name', 'version'], { unique: true })
export class AiModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ length: 100 })
  version: string;

  @Column({ length: 100, default: 'machine_learning' })
  type: ModelType; // ✅ Use typed model type here

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'training', 'deprecated'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'training' | 'deprecated';

  @Column('json', { nullable: true })
  configuration?: {
    algorithm?: string;
    parameters?: Record<string, any>;
    hyperparameters?: Record<string, any>;
    features?: string[];
    targetVariable?: string;
  };

  @Column('json', { nullable: true })
  metadata?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    trainingDataSize?: number;
    lastTrainingDate?: string;
    modelSize?: string;
    framework?: string;
  };

  @Column('json', { nullable: true })
  inputSchema?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };

  @Column('json', { nullable: true })
  outputSchema?: {
    type: string;
    properties: Record<string, any>;
  };

  @Column({ length: 500, nullable: true })
  modelPath?: string;

  @Column({ length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed?: Date;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  averageAccuracy?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  trainingCost?: number;

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Prediction, (prediction) => prediction.model, {
    cascade: ['remove'],
  })
  predictions: Prediction[];

  // Utility Methods
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsed = new Date();
  }

  updateAccuracy(newAccuracy: number): void {
    if (typeof this.averageAccuracy === 'number') {
      this.averageAccuracy = (this.averageAccuracy + newAccuracy) / 2;
    } else {
      this.averageAccuracy = newAccuracy;
    }
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  getDisplayName(): string {
    return `${this.name} v${this.version}`;
  }
}
