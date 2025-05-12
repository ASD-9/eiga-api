import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import {
  DeleteResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { Movie } from './entities/movie.entity';
import { SagasService } from '../sagas/sagas.service';
import { CategoriesService } from '../categories/categories.service';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { SagaResponseDto } from '../sagas/dto/saga-response.dto';
import { CategoryResponseDto } from '../categories/dto/category-response.dto';
import { NationalityResponseDto } from '../nationalities/dto/nationality-response.dto';
import { plainToInstance } from 'class-transformer';
import { MovieLightResponseDto } from './dto/movie-light-response.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MockFactory } from '../../test/mock-factory';
import { ProfilsService } from '..//profils/profils.service';
import { ProfilResponseDto } from '../profils/dto/profil-response.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;
  let sagasService: SagasService;
  let categoriesService: CategoriesService;
  let nationalitiesService: NationalitiesService;
  let profilsService: ProfilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SagasService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: NationalitiesService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: ProfilsService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    sagasService = module.get<SagasService>(SagasService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    nationalitiesService =
      module.get<NationalitiesService>(NationalitiesService);
    profilsService = module.get<ProfilsService>(ProfilsService);
  });

  describe('create', () => {
    it('should create a new movie and return it', async () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto();
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';
      const mockData = MockFactory.createMockMovie();

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(plainToInstance(SagaResponseDto, mockData.saga));
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(CategoryResponseDto, mockData.categories[0]),
        );
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(NationalityResponseDto, mockData.nationalities[0]),
        );
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(
        await service.create(createMovieDto, imageName, videoName),
      ).toEqual(plainToInstance(MovieLightResponseDto, mockData));
    });

    it('should thrown NotFoundException if the saga is not found', async () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto({
        saga_id: 99,
      });
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';

      jest
        .spyOn(sagasService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Saga 99 introuvable'));

      await expect(
        service.create(createMovieDto, imageName, videoName),
      ).rejects.toThrow(new NotFoundException('Saga 99 introuvable'));
    });

    it('should thrown NotFoundException if a category is not found', async () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto({
        categories_ids: [99],
      });
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';
      const saga = MockFactory.createMockSaga();

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(plainToInstance(SagaResponseDto, saga));
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Catégorie 99 introuvable'));

      await expect(
        service.create(createMovieDto, imageName, videoName),
      ).rejects.toThrow(new NotFoundException('Catégorie 99 introuvable'));
    });

    it('should thrown NotFoundException if a nationality is not found', async () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto({
        nationalities_ids: [99],
      });
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';
      const mockData = MockFactory.createMockMovie();

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(plainToInstance(SagaResponseDto, mockData.saga));
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(CategoryResponseDto, mockData.categories[0]),
        );
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockRejectedValue(
          new NotFoundException('Nationnalité 99 introuvable'),
        );

      await expect(
        service.create(createMovieDto, imageName, videoName),
      ).rejects.toThrow(new NotFoundException('Nationnalité 99 introuvable'));
    });

    it('should thrown InternalServerErrorException if an error occurs', async () => {
      const createMovieDto = MockFactory.createMockCreateMovieDto();
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';
      const mockData = MockFactory.createMockMovie();

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(plainToInstance(SagaResponseDto, mockData.saga));
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(CategoryResponseDto, mockData.categories[0]),
        );
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(NationalityResponseDto, mockData.nationalities[0]),
        );
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(
        service.create(createMovieDto, imageName, videoName),
      ).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const mockResult = [
        MockFactory.createMockMovie({
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
        MockFactory.createMockMovie({
          id: 2,
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(
        plainToInstance(MovieLightResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAll()).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAllByProfil', () => {
    it('should return an array of movies', async () => {
      const mockResult = [
        MockFactory.createMockMovie({
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
        MockFactory.createMockMovie({
          id: 2,
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAllByProfil(1)).toEqual(
        plainToInstance(MovieLightResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAllByProfil(1)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAllBySaga', () => {
    it('should return an array of movies', async () => {
      const mockResult = [
        MockFactory.createMockMovie({
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
        MockFactory.createMockMovie({
          id: 2,
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAllBySaga(1)).toEqual(
        plainToInstance(MovieLightResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAllByProfil(1)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findRandom', () => {
    it('should return an array of a n random movies', async () => {
      const mockResult = [
        MockFactory.createMockMovie({
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
        MockFactory.createMockMovie({
          id: 2,
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
      ];
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockResult),
      } as unknown as SelectQueryBuilder<Movie>);

      expect(await service.findRandom(2)).toEqual(
        plainToInstance(MovieLightResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Error')),
      } as unknown as SelectQueryBuilder<Movie>);

      await expect(service.findRandom(2)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findOneById', () => {
    it('should return a movie', async () => {
      const mockData = MockFactory.createMockMovie();
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockData);

      expect(await service.findOneById(1)).toEqual(
        plainToInstance(MovieResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneById(99)).rejects.toThrow(
        new NotFoundException(`Film 99 introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Error'));

      await expect(service.findOneById(1)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('update', () => {
    it('should update the user with the given id', async () => {
      const id = 1;
      const updateMovieDto = { title: 'Movie 1' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateMovieDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateMovieDto);
    });

    it('should throw NotFoundException if the mvoie is not found', async () => {
      const id = 99;
      const updateMovieDto = { title: 'Movie 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateMovieDto)).rejects.toThrow(
        new NotFoundException(`Film ${id} introuvable`),
      );
    });

    it('should throw NotFoundException if the saga is not found', async () => {
      const id = 99;
      const updateMovieDto = { title: 'Movie 1', saga_id: 1 };
      jest
        .spyOn(sagasService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Saga 1 introuvable'));

      await expect(service.update(id, updateMovieDto)).rejects.toThrow(
        new NotFoundException('Saga 1 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateMovieDto = { title: 'Movie 1' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateMovieDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the movie with the given id and delete his image', async () => {
      const testImageFilePath = join(
        process.cwd(),
        'public',
        'movies',
        'images',
        'image1.jpg',
      );
      const testVideoFilePath = join(
        process.cwd(),
        'public',
        'movies',
        'videos',
        'video1.mp4',
      );
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const id = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        image_name: 'image1.jpg',
        video_name: 'video1.mp4',
      } as Movie);
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
      expect(fs.existsSync(testImageFilePath)).toBe(false);
      expect(fs.existsSync(testVideoFilePath)).toBe(false);
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Film ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        image_name: 'image1.jpg',
        video_name: 'video1.mp4',
      } as Movie);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      await expect(service.remove(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('addToProfil', () => {
    it('should add the movie with the given id to the profil with the given id', async () => {
      const movieId = 1;
      const profilId = 1;
      const mockMovie = MockFactory.createMockMovie();
      const mockProfil = MockFactory.createMockProfil();

      jest
        .spyOn(profilsService, 'findOneById')
        .mockResolvedValue(plainToInstance(ProfilResponseDto, mockProfil));
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMovie);

      await service.addToProfil(movieId, profilId);

      expect(mockMovie.profils).toContainEqual(
        plainToInstance(ProfilResponseDto, mockProfil),
      );
    });

    it('should throw NotFoundException if the profil is not found', async () => {
      const movieId = 1;
      const profilId = 99;
      jest
        .spyOn(profilsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Profil 99 introuvable'));

      await expect(service.addToProfil(movieId, profilId)).rejects.toThrow(
        new NotFoundException('Profil 99 introuvable'),
      );
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const movieId = 99;
      const profilId = 1;
      const mockProfil = MockFactory.createMockProfil();
      jest
        .spyOn(profilsService, 'findOneById')
        .mockResolvedValue(plainToInstance(ProfilResponseDto, mockProfil));
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.addToProfil(movieId, profilId)).rejects.toThrow(
        new NotFoundException(`Film 99 introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const movieId = 99;
      const profilId = 1;
      const mockProfil = MockFactory.createMockProfil();
      jest
        .spyOn(profilsService, 'findOneById')
        .mockResolvedValue(plainToInstance(ProfilResponseDto, mockProfil));
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Error'));

      await expect(service.addToProfil(profilId, movieId)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('removeFromProfil', () => {
    it('should remove the movie with the given id from the profil with the given id', async () => {
      const movieId = 1;
      const profilId = 1;
      const mockProfil = MockFactory.createMockProfil();
      const mockMovie = MockFactory.createMockMovie({
        profils: [plainToInstance(ProfilResponseDto, mockProfil)],
      });

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMovie);

      await service.removeFromProfil(movieId, profilId);

      expect(mockMovie.profils).not.toContainEqual(
        plainToInstance(ProfilResponseDto, mockProfil),
      );
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const movieId = 99;
      const profilId = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.removeFromProfil(movieId, profilId)).rejects.toThrow(
        new NotFoundException(`Film 99 introuvable`),
      );
    });

    it('should throw InternalServerErrorException if there is an error', async () => {
      const movieId = 1;
      const profilId = 1;
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Error'));

      await expect(service.removeFromProfil(movieId, profilId)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });
});
