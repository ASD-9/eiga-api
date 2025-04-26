import { User } from '../../users/entities/user.entity';
import { Avatar } from '../../avatars/entities/avatar.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('Profils')
export class Profil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.profils)
  @JoinColumn({ name: 'user_id' })
  @Exclude()
  user: User;

  @ManyToOne(() => Avatar, (avatar) => avatar.profils, { eager: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar: Avatar;

  @Exclude()
  avatar_id: number;

  @Exclude()
  user_id: number;
}
