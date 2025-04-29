import { Exclude, Expose } from 'class-transformer';
import { RoleResponseDto } from '../../roles/dto/role-response.dto';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  role: RoleResponseDto;

  @Exclude()
  password: string;

  @Exclude()
  profils: any[];

  @Exclude()
  role_id: number;
}
