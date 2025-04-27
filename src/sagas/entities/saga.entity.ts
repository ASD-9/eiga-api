import { Exclude } from 'class-transformer';
import { Movie } from '../../movies/entities/movie.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Sagas')
export class Saga {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Movie, (movie) => movie.saga)
  @Exclude()
  movies: Movie[];
}
