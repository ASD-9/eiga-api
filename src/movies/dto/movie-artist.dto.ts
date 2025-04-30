import { Expose } from 'class-transformer';
import { JobResponseDto } from '../../jobs/dto/job-response.dto';

export class MovieArtistDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  job: JobResponseDto;
}
