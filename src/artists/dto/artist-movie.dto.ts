import { Expose } from 'class-transformer';
import { JobResponseDto } from '../../jobs/dto/job-response.dto';

export class ArtistMovieDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  image_name: string;

  @Expose()
  jobs: JobResponseDto;
}
