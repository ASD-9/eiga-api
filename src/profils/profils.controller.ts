import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfilsService } from './profils.service';
import { CreateProfilDto } from './dto/create-profil.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { Profil } from './entities/profil.entity';
import { plainToClass } from 'class-transformer';

@Controller('profils')
export class ProfilsController {
  constructor(private readonly profilsService: ProfilsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfilDto: CreateProfilDto): Promise<Profil> {
    return plainToClass(
      Profil,
      await this.profilsService.create(createProfilDto),
    );
  }

  @Get('user/:userId')
  findAllByUser(
    @Param('userId', ParseIdPipe) userId: number,
  ): Promise<Profil[]> {
    return this.profilsService.findAllByUser(userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateProfilDto: UpdateProfilDto,
  ): Promise<void> {
    return this.profilsService.update(id, updateProfilDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.profilsService.remove(id);
  }
}
