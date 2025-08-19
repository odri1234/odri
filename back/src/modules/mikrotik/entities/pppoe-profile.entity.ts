// src/modules/mikrotik/entities/pppoe-profile.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Isp } from '../../isps/entities/isp.entity';
import { User } from '../../users/entities/user.entity';

@Entity('pppoe_profiles')
export class PppoeProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  localAddress!: string;

  @Column()
  remoteAddress!: string;

  @Column()
  rateLimit!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Relationships
  @ManyToOne(() => Isp, (isp) => isp.pppoeProfiles, {
    onDelete: 'CASCADE',
    eager: true,
  })
  isp!: Isp;

  @ManyToOne(() => User, (user) => user.createdPppoeProfiles, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  createdBy?: User;

  // Audit Fields
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
