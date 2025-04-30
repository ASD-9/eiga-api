import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Saga } from '../../sagas/entities/saga.entity';
import { Category } from '../../categories/entities/category.entity';
import { Nationality } from '../../nationalities/entities/nationality.entity';
import { Profil } from '../../profils/entities/profil.entity';
import { MovieArtistJob } from '../../movie-artist-job/entities/movie-artist-job.entity';

@Entity('Movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  synopsis: string;

  @Column()
  image_name: string;

  @Column()
  duration: number;

  @Column()
  trailer_url: string;

  @Column()
  release_date: Date;

  @Column()
  video_name: string;

  @ManyToOne(() => Saga)
  @JoinColumn({ name: 'saga_id' })
  saga: Saga;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'Movie_category',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @ManyToMany(() => Nationality)
  @JoinTable({
    name: 'Movie_nationality',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'nationality_id', referencedColumnName: 'id' },
  })
  nationalities: Nationality[];

  @OneToMany(() => MovieArtistJob, (movieArtistJob) => movieArtistJob.movie)
  artists: MovieArtistJob[];

  @ManyToMany(() => Profil)
  @JoinTable({
    name: 'Profil_movie',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profil_id', referencedColumnName: 'id' },
  })
  profils: Profil[];
}
