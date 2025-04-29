import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Avatars')
export class Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image_name: string;
}
