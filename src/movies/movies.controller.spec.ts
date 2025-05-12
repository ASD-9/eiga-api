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
import { MockFactory } from '../../test/mock-factory';
import { ProfilsService } from '../profils/profils.service';

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
        {
          provide: ProfilsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  describe('create', () => {
    it('should return the created movie', async () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto();
      const files = {
        image: [{ filename: 'image1.jpg' }],
        video: [{ filename: 'video1.mp4' }],
      };
      const mockData = plainToInstance(
        MovieLightResponseDto,
        MockFactory.createMockMovie(),
      );
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(await controller.create(createMovieDto, files as any)).toEqual(
        mockData,
      );
    });

    it('should throw InternalServerErrorException if at least one file is missing', () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto();
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
      const mockResult = plainToInstance(MovieLightResponseDto, [
        MockFactory.createMockMovie(),
        MockFactory.createMockMovie({ id: 2 }),
      ]);
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);

      expect(await controller.findAll()).toEqual(mockResult);
    });
  });

  describe('findAllByProfil', () => {
    it('should return an array of movies', async () => {
      const mockResult = plainToInstance(MovieLightResponseDto, [
        MockFactory.createMockMovie(),
        MockFactory.createMockMovie({ id: 2 }),
      ]);
      jest.spyOn(service, 'findAllByProfil').mockResolvedValue(mockResult);

      expect(await controller.findAllByProfil(1)).toEqual(mockResult);
    });
  });

  describe('findAllBySaga', () => {
    it('should return an array of movies', async () => {
      const mockResult = plainToInstance(MovieLightResponseDto, [
        MockFactory.createMockMovie(),
        MockFactory.createMockMovie({ id: 2 }),
      ]);
      jest.spyOn(service, 'findAllBySaga').mockResolvedValue(mockResult);

      expect(await controller.findAllBySaga(1)).toEqual(mockResult);
    });
  });

  describe('findRandom', () => {
    it('should return an array of movies', async () => {
      const mockResult = plainToInstance(MovieLightResponseDto, [
        MockFactory.createMockMovie(),
        MockFactory.createMockMovie({ id: 2 }),
      ]);
      jest.spyOn(service, 'findRandom').mockResolvedValue(mockResult);

      expect(await controller.findRandom(2)).toEqual(mockResult);
    });
  });

  describe('findOneById', () => {
    it('should return a movie', async () => {
      const mockData = plainToInstance(
        MovieResponseDto,
        MockFactory.createMockMovie(),
      );
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockData);

      expect(await controller.findOneById(1)).toEqual(mockData);
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

  describe('addToProfil', () => {
    it('should return status 204 if the movie is successfully added to the profil', async () => {
      const movieId = 1;
      const profilId = 1;
      jest
        .spyOn(service, 'addToProfil')
        .mockImplementation(() => Promise.resolve());

      expect(await controller.addToProfil(movieId, profilId)).toBeUndefined();
    });
  });

  describe('removeFromProfil', () => {
    it('should return status 204 if the movie is successfully removed from the profil', async () => {
      const movieId = 1;
      const profilId = 1;
      jest
        .spyOn(service, 'removeFromProfil')
        .mockImplementation(() => Promise.resolve());

      expect(
        await controller.removeFromProfil(movieId, profilId),
      ).toBeUndefined();
    });
  });
});
