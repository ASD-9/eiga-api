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
import { ProfilsService } from '../profils/profils.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    private sagasService: SagasService,
    private categoriesService: CategoriesService,
    private nationalitiesService: NationalitiesService,
    private profilsService: ProfilsService,
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
          select: ['id', 'title', 'image_name', 'synopsis'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAllByProfil(profilId: number): Promise<MovieLightResponseDto[]> {
    try {
      return plainToInstance(
        MovieLightResponseDto,
        await this.moviesRepository.find({
          where: { profils: { id: profilId } },
          select: ['id', 'title', 'image_name', 'synopsis'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAllBySaga(sagaId: number): Promise<MovieLightResponseDto[]> {
    try {
      return plainToInstance(
        MovieLightResponseDto,
        await this.moviesRepository.find({
          where: { saga: { id: sagaId } },
          select: ['id', 'title', 'image_name', 'synopsis'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAllByCategory(
    categoryId: number,
  ): Promise<MovieLightResponseDto[]> {
    try {
      return plainToInstance(
        MovieLightResponseDto,
        await this.moviesRepository.find({
          where: { categories: { id: categoryId } },
          select: ['id', 'title', 'image_name', 'synopsis'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findRandom(number: number): Promise<MovieLightResponseDto[]> {
    try {
      return plainToInstance(
        MovieLightResponseDto,
        await this.moviesRepository
          .createQueryBuilder('movie')
          .select([
            'movie.id',
            'movie.title',
            'movie.image_name',
            'movie.synopsis',
          ])
          .orderBy('RAND()')
          .limit(number)
          .getMany(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<MovieResponseDto> {
    try {
      const movie: Movie | null = await this.moviesRepository.findOne({
        where: { id },
        relations: {
          saga: true,
          categories: true,
          nationalities: true,
          artists: {
            artist: true,
            job: true,
          },
        },
      });
      if (!movie) {
        throw new NotFoundException(`Film ${id} introuvable`);
      }
      const artists = movie.artists.map((entry) => ({
        id: entry.artist.id,
        name: entry.artist.name,
        job: entry.job,
      }));
      return plainToInstance(MovieResponseDto, {
        ...movie,
        artists,
      });
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

  async addToProfil(movieId: number, profilId: number): Promise<void> {
    try {
      const profil = await this.profilsService.findOneById(profilId);
      const movie = await this.moviesRepository.findOne({
        where: { id: movieId },
        relations: ['profils'],
      });
      if (!movie) {
        throw new NotFoundException(`Film ${movieId} introuvable`);
      }
      movie.profils.push(profil);
      await this.moviesRepository.save(movie);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async removeFromProfil(movieId: number, profilId: number): Promise<void> {
    try {
      const movie = await this.moviesRepository.findOne({
        where: { id: movieId },
        relations: ['profils'],
      });
      if (!movie) {
        throw new NotFoundException(`Film ${movieId} introuvable`);
      }
      movie.profils = movie.profils.filter((profil) => profil.id !== profilId);
      await this.moviesRepository.save(movie);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
