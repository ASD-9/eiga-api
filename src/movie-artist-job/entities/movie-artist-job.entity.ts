import { Artist } from '../../artists/entities/artist.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';

@Entity('Movie_artist_job')
export class MovieArtistJob {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.artists)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Artist, (artist) => artist.movies)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
