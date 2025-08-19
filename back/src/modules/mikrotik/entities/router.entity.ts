import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Isp } from '../../isps/entities/isp.entity';
import { User } from '../../users/entities/user.entity';

@Entity('routers')
export class Router {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  ipAddress!: string;

  @Column()
  apiPort!: number;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // ✅ Explicit foreign key for ISP
  @Column()
  ispId!: string;

  @ManyToOne(() => Isp, (isp) => isp.routers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'ispId' })
  isp!: Isp;

  @ManyToOne(() => User, (user) => user.createdRouters, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  createdBy?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
