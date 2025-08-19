import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // ✅ definite assignment

  @Column({ unique: true })
  macAddress!: string; // ✅ definite assignment

  @Column()
  deviceName!: string; // ✅ definite assignment

  @Column({ nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @ManyToOne(() => Session, (session) => session.devices, {
    onDelete: 'CASCADE',
  })
  session!: Session; // ✅ definite assignment

  @CreateDateColumn()
  createdAt!: Date; // ✅ definite assignment

  @UpdateDateColumn()
  updatedAt!: Date; // ✅ definite assignment
}
