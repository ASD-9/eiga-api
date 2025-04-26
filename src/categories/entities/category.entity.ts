import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
