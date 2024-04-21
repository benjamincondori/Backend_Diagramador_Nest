import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CoWorker } from '../../co-worker/entities/co-worker.entity';

@Entity('drawings')
export class Drawing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  data: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.drawings)
  user: User;

  @OneToMany(() => CoWorker, (coWorker) => coWorker.drawing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  coWorkers: CoWorker[];
}
