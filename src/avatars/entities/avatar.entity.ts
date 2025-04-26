import { Exclude } from 'class-transformer';
import { Profil } from '../../profils/entities/profil.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Avatars')
export class Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image_name: string;

  @OneToMany(() => Profil, (profil) => profil.avatar)
  @Exclude()
  profils: Profil[];
}
