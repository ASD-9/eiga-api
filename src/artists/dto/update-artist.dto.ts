import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateArtistDto } from './create-artist.dto';

export class UpdateArtistDto extends PartialType(
  OmitType(CreateArtistDto, ['jobs_ids', 'nationalities_ids']),
) {}
