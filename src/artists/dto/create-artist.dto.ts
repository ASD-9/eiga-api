import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateArtistDto {
  @IsString({
    message: "Le nom de l'artiste doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "Le nom de l'artiste ne doit pas être vide" })
  name: string;

  @IsString({
    message: "La biographie de l'artiste doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "La biographie de l'artiste ne doit pas être vide" })
  bio: string;

  @Type(() => Date)
  @IsDate({ message: 'La date de naissance doit être une date valide' })
  birthday: Date;

  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @ArrayMinSize(1, { message: "L'artiste doit avoir au moins un métier" })
  @IsInt({ each: true, message: 'Les métiers doivent être des entiers' })
  @IsPositive({ each: true, message: 'Les métiers doivent être positifs' })
  jobs_ids: number[];

  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @ArrayMinSize(1, { message: "L'artiste doit avoir au moins une nationalité" })
  @IsInt({ each: true, message: 'Les nationalités doivent être des entiers' })
  @IsPositive({ each: true, message: 'Les nationalités doivent être positifs' })
  nationalities_ids: number[];
}
