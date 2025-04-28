import { Expose } from 'class-transformer';

export class NationalityResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
