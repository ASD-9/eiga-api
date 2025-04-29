import { Exclude, Expose } from 'class-transformer';
import { AvatarResponseDto } from '../../avatars/dto/avatar-response.dto';

export class ProfilResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  avatar: AvatarResponseDto;

  @Exclude()
  user: any;

  @Exclude()
  avatar_id: number;

  @Exclude()
  user_id: number;
}
