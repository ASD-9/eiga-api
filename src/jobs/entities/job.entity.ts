import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
