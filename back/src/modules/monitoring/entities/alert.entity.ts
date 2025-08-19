import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Isp } from '../../../modules/isps/entities/isp.entity';
import { AlertType } from '../dto/alert.dto'; // Reuse enum from DTO if centralized

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; // ✅ Added (matches AlertDto)

  @Column()
  message!: string;

  @Column({
    type: 'enum',
    enum: AlertType, // ✅ Added type enum
  })
  type!: AlertType;

  @Column({ nullable: true })
  target?: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.INFO,
  })
  severity!: AlertSeverity;

  @Column({ default: false })
  resolved!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date; // ✅ Needed for `resolveAlert()`

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.alerts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  triggeredBy?: User;

  @ManyToOne(() => Isp, (isp) => isp.alerts, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  isp?: Isp;
}
