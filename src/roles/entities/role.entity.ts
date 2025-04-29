import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
