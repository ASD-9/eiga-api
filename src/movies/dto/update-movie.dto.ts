import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends PartialType(
  OmitType(CreateMovieDto, ['categories_ids', 'nationalities_ids']),
) {}
