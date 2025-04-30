import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class MovieArtistJobDto {
  @Type(() => Number)
  @IsInt({ message: "L'id du film doit être un entier" })
  @IsPositive({ message: "L'id du film doit être un entier positif" })
  movie_id: number;

  @Type(() => Number)
  @IsInt({ message: "L'id de l'artiste' doit être un entier" })
  @IsPositive({ message: "L'id de l'artiste' doit être un entier positif" })
  artist_id: number;

  @Type(() => Number)
  @IsInt({ message: "L'id du métier doit être un entier" })
  @IsPositive({ message: "L'id du métier doit être un entier positif" })
  job_id: number;
}
