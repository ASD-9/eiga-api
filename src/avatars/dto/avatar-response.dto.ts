import { Exclude, Expose } from 'class-transformer';

export class AvatarResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  image_name: string;
}
