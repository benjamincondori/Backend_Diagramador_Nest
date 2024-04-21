import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Drawing } from '../../drawing/entities/drawing.entity';

@Entity('co_workers')
export class CoWorker {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.coWorkers)
  user: User;

  @ManyToOne(() => Drawing, (drawing) => drawing.coWorkers, {
    onDelete: 'CASCADE',
  })
  drawing: Drawing;
}
