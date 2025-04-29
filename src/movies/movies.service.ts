import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository, UpdateResult } from 'typeorm';
import { SagasService } from '../sagas/sagas.service';
import { CategoriesService } from '../categories/categories.service';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { Saga } from '../sagas/entities/saga.entity';
import { join } from 'path';
import * as fs from 'fs';
import { MovieLightResponseDto } from './dto/movie-light-response.dto';
import { plainToInstance } from 'class-transformer';
import { MovieResponseDto } from './dto/movie-response.dto';
import { SagaResponseDto } from '../sagas/dto/saga-response.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    private sagasService: SagasService,
    private categoriesService: CategoriesService,
    private nationalitiesService: NationalitiesService,
  ) {}

  async create(
    createMovieDto: CreateMovieDto,
    imageName: string,
    videoName: string,
  ): Promise<MovieLightResponseDto> {
    try {
      const { saga_id, categories_ids, nationalities_ids, ...rest } = {
        ...createMovieDto,
      };
      const createData: Partial<Movie> = { ...rest };

      if (saga_id) {
        createData.saga = (await this.sagasService.findOneById(
          saga_id,
        )) as Saga;
      }
      createData.categories = [];
      for (const categoryId of categories_ids) {
        createData.categories.push(
          await this.categoriesService.findOneById(categoryId),
        );
      }
      createData.nationalities = [];
      for (const nationalityId of nationalities_ids) {
        createData.nationalities.push(
          await this.nationalitiesService.findOneById(nationalityId),
        );
      }

      const movie: Movie = await this.moviesRepository.save({
        ...createData,
        image_name: imageName,
        video_name: videoName,
      });

      return plainToInstance(MovieLightResponseDto, movie);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<MovieLightResponseDto[]> {
    try {
      return plainToInstance(
        MovieLightResponseDto,
        await this.moviesRepository.find({
          select: ['id', 'title', 'image_name'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAllByProfilId(profilId: number): Promise<MovieLightResponseDto[]> {
    try {
      return plainToInstance(
        MovieLightResponseDto,
        await this.moviesRepository.find({
          where: { profils: { id: profilId } },
          select: ['id', 'title', 'image_name'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<MovieResponseDto> {
    try {
      const movie: Movie | null = await this.moviesRepository.findOneBy({
        id,
      });
      if (!movie) {
        throw new NotFoundException(`Film ${id} introuvable`);
      }
      return plainToInstance(MovieResponseDto, movie);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<void> {
    try {
      const { saga_id, ...rest } = { ...updateMovieDto };
      const updateData: Partial<Movie> = { ...rest };
      if (saga_id) {
        const saga: SagaResponseDto =
          await this.sagasService.findOneById(saga_id);
        updateData.saga = saga as Saga;
      }

      const result: UpdateResult = await this.moviesRepository.update(
        id,
        updateData,
      );

      if (result.affected === 0) {
        throw new NotFoundException(`Film ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const movie = await this.moviesRepository.findOne({
        where: { id },
        select: ['image_name', 'video_name'],
      });
      if (!movie) {
        throw new NotFoundException(`Film ${id} introuvable`);
      }
      await this.moviesRepository.delete(id);
      const movieImagePath = join(
        process.cwd(),
        'public',
        'movies',
        'images',
        movie.image_name,
      );
      const movieVideoPath = join(
        process.cwd(),
        'public',
        'movies',
        'videos',
        movie.video_name,
      );
      if (fs.existsSync(movieImagePath)) {
        try {
          fs.unlinkSync(movieImagePath);
        } catch (error) {
          console.log(error);
        }
      }
      if (fs.existsSync(movieVideoPath)) {
        try {
          fs.unlinkSync(movieVideoPath);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
