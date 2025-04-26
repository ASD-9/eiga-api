import { IsNotEmpty, IsString } from 'class-validator';

export class JobDto {
  @IsString({
    message: 'Le nom du métier doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le nom du métier ne doit pas être vide' })
  name: string;
}
