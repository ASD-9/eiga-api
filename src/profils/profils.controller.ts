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
import { ProfilResponseDto } from './dto/profil-response.dto';

@Controller('profils')
export class ProfilsController {
  constructor(private readonly profilsService: ProfilsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfilDto: CreateProfilDto): Promise<ProfilResponseDto> {
    return this.profilsService.create(createProfilDto);
  }

  @Get('user/:userId')
  findAllByUser(
    @Param('userId', ParseIdPipe) userId: number,
  ): Promise<ProfilResponseDto[]> {
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
