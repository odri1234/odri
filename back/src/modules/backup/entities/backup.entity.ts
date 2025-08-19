import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fileName!: string;

  @Column()
  filePath!: string;

  @Column({ type: 'bigint' })
  fileSize!: number;

  @Column({ default: 'completed' })
  status!: string; // <-- Added to match service expectations

  @Column({ default: false })
  isEncrypted!: boolean;

  @Column({ nullable: true })
  encryptionKey?: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Backward compatibility
  get name(): string {
    return this.fileName;
  }

  get path(): string {
    return this.filePath;
  }
}
