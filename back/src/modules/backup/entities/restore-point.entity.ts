import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Backup } from './backup.entity';

@Entity('restore_history')
export class RestoreHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Backup, { nullable: false, onDelete: 'CASCADE' })
  backup!: Backup;

  @Column()
  restoredBy!: string;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  restoredAt!: Date;
}
