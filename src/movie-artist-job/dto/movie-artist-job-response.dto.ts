import { Exclude, Expose, Type } from 'class-transformer';
import { ArtistLightResponseDto } from '../../artists/dto/artist-light-response.dto';
import { JobResponseDto } from '../../jobs/dto/job-response.dto';
import { MovieLightResponseDto } from '../../movies/dto/movie-light-response.dto';

export class MovieArtistJobResponseDto {
  @Type(() => MovieLightResponseDto)
  @Expose()
  movie: MovieLightResponseDto;

  @Type(() => ArtistLightResponseDto)
  @Expose()
  artist: ArtistLightResponseDto;

  @Type(() => JobResponseDto)
  @Expose()
  job: JobResponseDto;

  @Exclude()
  id: number;
}
