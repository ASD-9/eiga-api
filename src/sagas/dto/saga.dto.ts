import { IsNotEmpty, IsString } from 'class-validator';

export class SagaDto {
  @IsString({ message: 'Le nom de la saga doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom de la saga ne doit pas être vide' })
  name: string;
}
