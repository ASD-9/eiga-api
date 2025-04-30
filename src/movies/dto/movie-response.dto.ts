import { Exclude, Expose } from 'class-transformer';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { SagaResponseDto } from '../../sagas/dto/saga-response.dto';

export class MovieResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  image_name: string;

  @Expose()
  synopsis: string;

  @Expose()
  duration: number;

  @Expose()
  trailer_url: string;

  @Expose()
  release_date: Date;

  @Expose()
  video_name: string;

  @Expose()
  saga: SagaResponseDto;

  @Expose()
  categories: CategoryResponseDto[];

  @Expose()
  nationalities: any[];

  @Exclude()
  profils: any[];
}
