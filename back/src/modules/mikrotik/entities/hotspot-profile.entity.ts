// src/modules/mikrotik/entities/hotspot-profile.entity.ts

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

@Entity('hotspot_profiles')
export class HotspotProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column('int')
  sharedUsers!: number;

  @Column()
  rateLimit!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Relationships
  @ManyToOne(() => Isp, (isp) => isp.hotspotProfiles, {
    onDelete: 'CASCADE',
    eager: true,
  })
  isp!: Isp;

  @ManyToOne(() => User, (user) => user.createdHotspotProfiles, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  createdBy?: User;

  // Audit Fields
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
