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
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { ParseIdPipe } from '../common/parse-id.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { movieUploadConfig } from '../common/upload.config';
import { FileCleanupInterceptor } from '../common/file.cleanup-interceptor';
import { plainToInstance } from 'class-transformer';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileCleanupInterceptor,
    FileFieldsInterceptor(
      [
        {
          name: 'image',
          maxCount: 1,
        },
        {
          name: 'video',
          maxCount: 1,
        },
      ],
      movieUploadConfig,
    ),
  )
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ): Promise<Movie> {
    if (!files.image || !files.video) {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
    return plainToInstance(
      Movie,
      await this.moviesService.create(
        createMovieDto,
        files.image[0].filename,
        files.video[0].filename,
      ),
    );
  }

  @Get()
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<void> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.moviesService.remove(id);
  }
}
