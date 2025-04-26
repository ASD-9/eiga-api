import { IsNotEmpty, IsString } from 'class-validator';

export class NationalityDto {
  @IsString({
    message: 'Le nom de la nationalité doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le nom de la nationalité ne doit pas être vide' })
  name: string;
}
