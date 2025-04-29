import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
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

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;
  let sagasService: SagasService;
  let categoriesService: CategoriesService;
  let nationalitiesService: NationalitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
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
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    sagasService = module.get<SagasService>(SagasService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    nationalitiesService =
      module.get<NationalitiesService>(NationalitiesService);
  });

  describe('create', () => {
    it('should create a new movie and return it', async () => {
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
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(mockData.saga as SagaResponseDto);
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockResolvedValue(mockData.categories[0] as CategoryResponseDto);
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(mockData.nationalities[0] as NationalityResponseDto);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData as Movie);

      expect(
        await service.create(createMovieDto, imageName, videoName),
      ).toEqual(plainToInstance(MovieLightResponseDto, mockData));
    });

    it('should thrown NotFoundException if the saga is not found', async () => {
      const createMovieDto = {
        title: 'Movie 1',
        synopsis: 'Synopsis 1',
        duration: 120,
        trailer_url: 'https://example.com/trailer1',
        release_date: new Date('2014-01-01'),
        saga_id: 99,
        categories_ids: [1],
        nationalities_ids: [1],
      };
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
      const createMovieDto = {
        title: 'Movie 1',
        synopsis: 'Synopsis 1',
        duration: 120,
        trailer_url: 'https://example.com/trailer1',
        release_date: new Date('2014-01-01'),
        saga_id: 1,
        categories_ids: [99],
        nationalities_ids: [1],
      };
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(mockData.saga as SagaResponseDto);
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Catégorie 99 introuvable'));

      await expect(
        service.create(createMovieDto, imageName, videoName),
      ).rejects.toThrow(new NotFoundException('Catégorie 99 introuvable'));
    });

    it('should thrown NotFoundException if a nationality is not found', async () => {
      const createMovieDto = {
        title: 'Movie 1',
        synopsis: 'Synopsis 1',
        duration: 120,
        trailer_url: 'https://example.com/trailer1',
        release_date: new Date('2014-01-01'),
        saga_id: 1,
        categories_ids: [1],
        nationalities_ids: [99],
      };
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(mockData.saga as SagaResponseDto);
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockResolvedValue(mockData.categories[0] as CategoryResponseDto);
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
      const imageName = 'image1.jpg';
      const videoName = 'video1.mp4';

      jest
        .spyOn(sagasService, 'findOneById')
        .mockResolvedValue(mockData.saga as SagaResponseDto);
      jest
        .spyOn(categoriesService, 'findOneById')
        .mockResolvedValue(mockData.categories[0] as CategoryResponseDto);
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(mockData.nationalities[0] as NationalityResponseDto);
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
        {
          id: mockData.id,
          title: mockData.title,
          image_name: mockData.image_name,
        },
        {
          id: mockData2.id,
          title: mockData2.title,
          image_name: mockData2.image_name,
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult as Movie[]);

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
});
