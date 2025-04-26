import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Nationalities')
export class Nationality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
