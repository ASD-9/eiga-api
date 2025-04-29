import { Expose } from 'class-transformer';

export class SagaResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
