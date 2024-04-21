import { Drawing } from './../../drawing/entities/drawing.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../../profile/entities/profile.entity';
import { CoWorker } from '../../co-worker/entities/co-worker.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text', {
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Column('text', {
    select: false,
  })
  password: string;

  @ApiProperty()
  @Column('text')
  name: string;

  @ApiProperty()
  @Column('text')
  lastName: string;

  @ApiProperty()
  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Drawing, (drawing) => drawing.user)
  drawings: Drawing[];

  @OneToMany(() => CoWorker, (coWorker) => coWorker.user)
  coWorkers: CoWorker[];

  @BeforeInsert() //trigger
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate() //trigger
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
