import {
  Controller,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MovieArtistJobService } from './movie-artist-job.service';
import { MovieArtistJobDto } from './dto/movie-artist-job.dto';
import { MovieArtistJobResponseDto } from './dto/movie-artist-job-response.dto';

@Controller('movie-artist-job')
export class MovieArtistJobController {
  constructor(private readonly movieArtistJobService: MovieArtistJobService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createMovieArtistJobDto: MovieArtistJobDto,
  ): Promise<MovieArtistJobResponseDto> {
    return this.movieArtistJobService.create(createMovieArtistJobDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Body() deleteMovieArtistJobDto: MovieArtistJobDto): Promise<void> {
    return this.movieArtistJobService.remove(deleteMovieArtistJobDto);
  }
}
