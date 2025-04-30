import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsService } from './artists.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { JobsService } from '../jobs/jobs.service';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { JobResponseDto } from '../jobs/dto/job-response.dto';
import { NationalityResponseDto } from '../nationalities/dto/nationality-response.dto';
import { plainToInstance } from 'class-transformer';
import { ArtistLightResponseDto } from './dto/artist-light-response.dto';
import { ArtistResponseDto } from './dto/artist-response';
import { MockFactory } from '../../test/mock-factory';

describe('ArtistsService', () => {
  let service: ArtistsService;
  let repository: Repository<Artist>;
  let jobsService: JobsService;
  let nationalitiesService: NationalitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
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
          provide: JobsService,
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

    service = module.get<ArtistsService>(ArtistsService);
    repository = module.get<Repository<Artist>>(getRepositoryToken(Artist));
    jobsService = module.get<JobsService>(JobsService);
    nationalitiesService =
      module.get<NationalitiesService>(NationalitiesService);
  });

  describe('create', () => {
    it('should create a new artist and return it', async () => {
      const createArtistDto = MockFactory.createMockCreateArtistDto();
      const imageName = 'artist1.jpg';
      const mockData = MockFactory.createMockArtist();

      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(plainToInstance(JobResponseDto, mockData.jobs[0]));
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(NationalityResponseDto, mockData.nationalities[0]),
        );

      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createArtistDto, imageName)).toEqual(
        plainToInstance(ArtistLightResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if a job is not found', async () => {
      const createArtistDto = MockFactory.createMockCreateArtistDto({
        jobs_ids: [99],
      });
      const imageName = 'artist1.jpg';

      jest
        .spyOn(jobsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Métier 99 introuvable'));

      await expect(service.create(createArtistDto, imageName)).rejects.toThrow(
        new NotFoundException('Métier 99 introuvable'),
      );
    });

    it('should throw NotFoundException if a nationality is not found', async () => {
      const createArtistDto = MockFactory.createMockCreateArtistDto({
        nationalities_ids: [99],
      });
      const imageName = 'artist1.jpg';
      const job = MockFactory.createMockJob();

      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(plainToInstance(JobResponseDto, job));
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Nationalité 99 introuvable'));

      await expect(service.create(createArtistDto, imageName)).rejects.toThrow(
        new NotFoundException('Nationalité 99 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createArtistDto = MockFactory.createMockCreateArtistDto();
      const imageName = 'artist1.jpg';
      const mockData = MockFactory.createMockArtist();

      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(plainToInstance(JobResponseDto, mockData.jobs[0]));
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(NationalityResponseDto, mockData.nationalities[0]),
        );

      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createArtistDto, imageName)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an arrray of artists', async () => {
      const mockResult = [
        MockFactory.createMockArtist({
          bio: undefined,
          birthday: undefined,
          jobs: undefined,
          nationalities: undefined,
        }),
        MockFactory.createMockArtist({
          id: 2,
          bio: undefined,
          birthday: undefined,
          jobs: undefined,
          nationalities: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(
        plainToInstance(ArtistLightResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAll()).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findOneById', () => {
    it('should return the artist with the given id', async () => {
      const mockData = MockFactory.createMockArtist();
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockData);

      expect(await service.findOneById(1)).toEqual(
        plainToInstance(ArtistResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(99)).rejects.toThrow(
        new NotFoundException(`Artiste 99 introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error());

      await expect(service.findOneById(1)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('update', () => {
    it('should update the artist with the given id', async () => {
      const id = 1;
      const updateArtistDto = { name: 'editedArtist' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateArtistDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateArtistDto);
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      const id = 99;
      const updateArtistDto = { name: 'editedArtist' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateArtistDto)).rejects.toThrow(
        new NotFoundException(`Artiste ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateArtistDto = { name: 'editedArtist' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateArtistDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the artist with the given id and delete his image', async () => {
      const testFilePath = join(
        process.cwd(),
        'public',
        'artists',
        'artist1.jpg',
      );
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const id = 1;
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ image_name: 'artist1.jpg' } as Artist);
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
      expect(fs.existsSync(testFilePath)).toBe(false);
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Artiste ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ image_name: 'artist1.jpg' } as Artist);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      await expect(service.remove(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });
});
