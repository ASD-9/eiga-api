import { Expose } from 'class-transformer';
import { JobResponseDto } from '../../jobs/dto/job-response.dto';
import { NationalityResponseDto } from '../../nationalities/dto/nationality-response.dto';
import { ArtistMovieDto } from './artist-movie.dto';

export class ArtistResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  image_name: string;

  @Expose()
  bio: string;

  @Expose()
  birthday: Date;

  @Expose()
  jobs: JobResponseDto[];

  @Expose()
  nationalities: NationalityResponseDto[];

  @Expose()
  movies: ArtistMovieDto[];
}
