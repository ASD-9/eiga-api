import { Exclude, Expose } from 'class-transformer';
import { JobResponseDto } from '../../jobs/dto/job-response.dto';
import { NationalityResponseDto } from '../../nationalities/dto/nationality-response.dto';

export class ArtistLightResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  image_name: string;

  @Exclude()
  bio: string;

  @Exclude()
  birthday: Date;

  @Exclude()
  jobs: JobResponseDto[];

  @Exclude()
  nationalities: NationalityResponseDto[];

  @Exclude()
  jobs_ids: number[];

  @Exclude()
  nationalities_ids: number[];
}
