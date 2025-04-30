import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MovieArtistJobDto } from './dto/movie-artist-job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieArtistJob } from './entities/movie-artist-job.entity';
import { DeleteResult, Repository } from 'typeorm';
import { MoviesService } from '../movies/movies.service';
import { ArtistsService } from '../artists/artists.service';
import { JobsService } from '../jobs/jobs.service';
import { plainToInstance } from 'class-transformer';
import { MovieArtistJobResponseDto } from './dto/movie-artist-job-response.dto';

@Injectable()
export class MovieArtistJobService {
  constructor(
    @InjectRepository(MovieArtistJob)
    private movieArtistJobRepository: Repository<MovieArtistJob>,
    private moviesService: MoviesService,
    private artistsService: ArtistsService,
    private jobsService: JobsService,
  ) {}

  async create(
    createMovieArtistJobDto: MovieArtistJobDto,
  ): Promise<MovieArtistJobResponseDto> {
    try {
      const movie = await this.moviesService.findOneById(
        createMovieArtistJobDto.movie_id,
      );
      const artist = await this.artistsService.findOneById(
        createMovieArtistJobDto.artist_id,
      );
      const job = await this.jobsService.findOneById(
        createMovieArtistJobDto.job_id,
      );
      return plainToInstance(
        MovieArtistJobResponseDto,
        await this.movieArtistJobRepository.save({
          movie,
          artist,
          job,
        }),
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async remove(deleteMovieArtistJobDto: MovieArtistJobDto): Promise<void> {
    try {
      const result: DeleteResult = await this.movieArtistJobRepository.delete({
        movie: { id: deleteMovieArtistJobDto.movie_id },
        artist: { id: deleteMovieArtistJobDto.artist_id },
        job: { id: deleteMovieArtistJobDto.job_id },
      });
      if (result.affected === 0) {
        throw new NotFoundException(
          `Relation entre film ${deleteMovieArtistJobDto.movie_id}, artiste ${deleteMovieArtistJobDto.artist_id} et métier ${deleteMovieArtistJobDto.job_id} introuvable`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
