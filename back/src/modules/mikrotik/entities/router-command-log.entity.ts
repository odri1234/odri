import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class RouterCommandLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  routerIp: string;

  @Column()
  command: string;

  @Column('text', { nullable: true })
  response: string;

  @Column('text', { nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
