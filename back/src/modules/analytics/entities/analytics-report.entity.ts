import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';

import { Isp } from '../../isps/entities/isp.entity';
import { User } from '../../users/entities/user.entity';  // Import User entity for relation
import { UserRole } from '../../users/constants/user-role.constants';  // Import roles enum if needed

@Entity('analytics_reports')
export class AnalyticsReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  data: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  generatedFor?: string;

  @ManyToOne(() => Isp, (isp) => isp.analyticsReports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ispId' })
  isp?: Isp;

  @ManyToOne(() => User, (user) => user.generatedReports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'generatedById' })
  generatedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  generatedByName?: string;

  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  frequency: 'daily' | 'weekly' | 'monthly' | string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
