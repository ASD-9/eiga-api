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
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { FileCleanupInterceptor } from '../common/file.cleanup-interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { artistUploadConfig } from '../common/upload.config';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { ArtistLightResponseDto } from './dto/artist-light-response.dto';
import { ArtistResponseDto } from './dto/artist-response';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileCleanupInterceptor,
    FileInterceptor('image', artistUploadConfig),
  )
  create(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ArtistLightResponseDto> {
    if (!file) {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
    return this.artistsService.create(createArtistDto, file.filename);
  }

  @Get()
  findAll(): Promise<ArtistLightResponseDto[]> {
    return this.artistsService.findAll();
  }

  @Get(':id')
  findOneById(
    @Param('id', ParseIdPipe) id: number,
  ): Promise<ArtistResponseDto> {
    return this.artistsService.findOneById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateArtistDto: UpdateArtistDto,
  ): Promise<void> {
    return this.artistsService.update(id, updateArtistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.artistsService.remove(id);
  }
}
