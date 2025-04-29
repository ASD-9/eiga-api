import { Expose } from 'class-transformer';

export class JobResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
