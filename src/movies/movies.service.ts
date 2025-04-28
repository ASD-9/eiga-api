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
import { Category } from '../categories/entities/category.entity';
import { Nationality } from '../nationalities/entities/nationality.entity';
import { join } from 'path';
import * as fs from 'fs';

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
  ): Promise<Movie> {
    try {
      const saga: Saga = await this.sagasService.findOneById(
        createMovieDto.saga_id,
      );

      const categories: Category[] = [];
      for (const categoryId of createMovieDto.categories_ids) {
        categories.push(await this.categoriesService.findOneById(categoryId));
      }

      const nationalities: Nationality[] = [];
      for (const nationalityId of createMovieDto.nationalities_ids) {
        nationalities.push(
          await this.nationalitiesService.findOneById(nationalityId),
        );
      }

      return await this.moviesRepository.save({
        ...createMovieDto,
        saga,
        categories,
        nationalities,
        image_name: imageName,
        video_name: videoName,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<Movie[]> {
    try {
      return await this.moviesRepository.find();
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<void> {
    try {
      const { saga_id, ...updateData }: Partial<Movie> = { ...updateMovieDto };
      if (saga_id) {
        const saga: Saga = await this.sagasService.findOneById(saga_id);
        updateData.saga = saga;
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
