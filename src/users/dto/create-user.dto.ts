import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom ne doit pas être vide' })
  @MinLength(3, { message: 'Le nom doit avoir au moins 3 caractères' })
  username: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe ne doit pas être vide' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Le mot de passe doit avoir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
    },
  )
  password: string;

  @IsInt({ message: 'Le rôle doit être un entier' })
  @IsPositive({ message: 'Le rôle doit être un entier positif' })
  role_id: number;
}
