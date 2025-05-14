import { Exclude, Expose } from 'class-transformer';

export class MovieLightResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  image_name: string;

  @Expose()
  synopsis: string;

  @Exclude()
  duration: number;

  @Exclude()
  trailer_url: string;

  @Exclude()
  release_date: Date;

  @Exclude()
  video_name: string;

  @Exclude()
  saga: any;

  @Exclude()
  categories: any[];

  @Exclude()
  nationalities: any[];

  @Exclude()
  artists: any[];

  @Exclude()
  profils: any[];

  @Exclude()
  saga_id: number;

  @Exclude()
  categories_ids: number[];

  @Exclude()
  nationalities_ids: number[];
}
