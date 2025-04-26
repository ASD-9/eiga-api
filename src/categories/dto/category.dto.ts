import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @IsString({
    message: 'Le nom de la catégorie doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le nom de la catégorie ne doit pas être vide' })
  name: string;
}
