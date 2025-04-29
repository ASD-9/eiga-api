import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProfilDto } from './create-profil.dto';

export class UpdateProfilDto extends OmitType(PartialType(CreateProfilDto), [
  'user_id',
]) {}
