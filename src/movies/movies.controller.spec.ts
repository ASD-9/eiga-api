import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { SagasService } from '../sagas/sagas.service';
import { CategoriesService } from '../categories/categories.service';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MovieLightResponseDto } from './dto/movie-light-response.dto';
import { MovieResponseDto } from './dto/movie-response.dto';

const mockData = {
  id: 1,
  title: 'Movie 1',
  synopsis: 'Synopsis 1',
  image_name: 'image1.jpg',
  duration: 120,
  trailer_url: 'https://example.com/trailer1',
  release_date: new Date('2014-01-01'),
  video_name: 'video1.mp4',
  saga: {
    id: 1,
    name: 'Saga 1',
  },
  categories: [
    {
      id: 1,
      name: 'Category 1',
    },
  ],
  nationalities: [
    {
      id: 1,
      name: 'Nationality 1',
    },
  ],
};

const mockData2 = {
  id: 2,
  title: 'Movie 2',
  synopsis: 'Synopsis 2',
  image_name: 'image2.jpg',
  duration: 120,
  trailer_url: 'https://example.com/trailer2',
  release_date: new Date('2014-01-01'),
  video_name: 'video2.mp4',
  saga: {
    id: 1,
    name: 'Saga 1',
  },
  categories: [
    {
      id: 1,
      name: 'Category 1',
    },
  ],
  nationalities: [
    {
      id: 1,
      name: 'Nationality 1',
    },
  ],
};

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {},
        },
        {
          provide: SagasService,
          useValue: {},
        },
        {
          provide: CategoriesService,
          useValue: {},
        },
        {
          provide: NationalitiesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  describe('create', () => {
    it('should return the created movie', async () => {
      const createMovieDto = {
        title: 'Movie 1',
        synopsis: 'Synopsis 1',
        duration: 120,
        trailer_url: 'https://example.com/trailer1',
        release_date: new Date('2014-01-01'),
        saga_id: 1,
        categories_ids: [1],
        nationalities_ids: [1],
      };
      const files = {
        image: [{ filename: 'image1.jpg' }],
        video: [{ filename: 'video1.mp4' }],
      };
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(plainToInstance(MovieLightResponseDto, mockData));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(await controller.create(createMovieDto, files as any)).toEqual(
        plainToInstance(MovieLightResponseDto, mockData),
      );
    });

    it('should throw InternalServerErrorException if at least one file is missing', () => {
      const createMovieDto = {
        title: 'Movie 1',
        synopsis: 'Synopsis 1',
        duration: 120,
        trailer_url: 'https://example.com/trailer1',
        release_date: new Date('2014-01-01'),
        saga_id: 1,
        categories_ids: [1],
        nationalities_ids: [1],
      };
      const files = {
        image: [{ filename: 'image1.jpg' }],
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => controller.create(createMovieDto, files as any)).toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(plainToInstance(MovieLightResponseDto, mockResult));

      expect(await controller.findAll()).toEqual(
        plainToInstance(MovieLightResponseDto, mockResult),
      );
    });
  });

  describe('findOneById', () => {
    it('should return a movie', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue(plainToInstance(MovieResponseDto, mockData));

      expect(await controller.findOneById(1)).toEqual(
        plainToInstance(MovieResponseDto, mockData),
      );
    });
  });

  describe('update', () => {
    it('should return status 204 if the movie is successfully updated', async () => {
      const id = 1;
      const updateMovieDto = { title: 'Movie 1' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateMovieDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the movie is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
