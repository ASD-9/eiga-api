import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProfilDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom ne doit pas être vide' })
  @MinLength(3, { message: 'Le nom doit avoir au moins 3 caractères' })
  name: string;

  @IsInt({ message: "L'id de l'utilisateur doit être un entier" })
  @IsPositive({ message: "L'id de l'utilisateur doit être un entier positif" })
  user_id: number;

  @IsInt({ message: "L'id de l'avatar doit être un entier" })
  @IsPositive({ message: "L'id de l'avatar doit être un entier positif" })
  avatar_id: number;
}
