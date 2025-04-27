import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsString({ message: 'Le titre du film doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre du film ne doit pas être vide' })
  title: string;

  @IsString({
    message: 'Le synopsis du film doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le synopsis du film ne doit pas être vide' })
  synopsis: string;

  @Type(() => Number)
  @IsInt({ message: 'La durée du film doit être un entier' })
  @IsPositive({ message: 'La durée du film doit être un entier positif' })
  duration: number;

  @IsString({
    message: "L'url du trailer du film doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "L'url du trailer du film ne doit pas être vide" })
  trailer_url: string;

  @Type(() => Date)
  @IsDate({ message: 'La date de sortie du film doit être une date valide' })
  release_date: Date;

  @Type(() => Number)
  @IsInt({ message: "L'id de la saga doit être un entier" })
  @IsPositive({ message: "L'id de la saga doit être un entier positif" })
  saga_id: number;

  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @ArrayMinSize(1, { message: 'Le film doit avoir au moins une catégorie' })
  @IsInt({ each: true, message: 'Les catégories doivent être des entiers' })
  @IsPositive({ each: true, message: 'Les catégories doivent être positifs' })
  categories_ids: number[];

  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @ArrayMinSize(1, { message: 'Le film doit avoir au moins une nationalité' })
  @IsInt({ each: true, message: 'Les nationalités doivent être des entiers' })
  @IsPositive({ each: true, message: 'Les nationalités doivent être positifs' })
  nationalities_ids: number[];
}
