import { IsNotEmpty, IsString } from 'class-validator';

export class AvatarDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom ne doit pas être vide' })
  name: string;
}
