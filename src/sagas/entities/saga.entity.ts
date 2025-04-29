import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Sagas')
export class Saga {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
