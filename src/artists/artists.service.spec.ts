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

const mockData = {
  id: 1,
  name: 'Artist 1',
  image_name: 'artist1.jpg',
  bio: 'Artist 1 bio',
  birthday: new Date('1990-01-01'),
  jobs: [
    {
      id: 1,
      name: 'Job 1',
    },
  ],
  nationalities: [
    {
      id: 1,
      name: 'Nationality 1',
    },
  ],
  jobs_ids: [1],
  nationalities_ids: [1],
};

const mockData2 = {
  id: 2,
  name: 'Artist 2',
  image_name: 'artist2.jpg',
  bio: 'Artist 2 bio',
  birthday: new Date('1990-01-01'),
  jobs: [
    {
      id: 1,
      name: 'Job 1',
    },
  ],
  nationalities: [
    {
      id: 1,
      name: 'Nationality 1',
    },
  ],
  jobs_ids: [1],
  nationalities_ids: [1],
};

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
      const createArtistDto = {
        name: 'Artist 1',
        bio: 'Artist 1 bio',
        birthday: new Date('1990-01-01'),
        jobs_ids: [1],
        nationalities_ids: [1],
      };
      const imageName = 'artist1.jpg';

      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(mockData.jobs[0]);
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(mockData.nationalities[0]);

      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createArtistDto, imageName)).toEqual(
        mockData,
      );
    });

    it('should throw NotFoundException if a job is not found', async () => {
      const createArtistDto = {
        name: 'Artist 1',
        bio: 'Artist 1 bio',
        birthday: new Date('1990-01-01'),
        jobs_ids: [99],
        nationalities_ids: [1],
      };
      const imageName = 'artist1.jpg';

      jest
        .spyOn(jobsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Job 99 introuvable'));

      await expect(service.create(createArtistDto, imageName)).rejects.toThrow(
        new NotFoundException('Job 99 introuvable'),
      );
    });

    it('should throw NotFoundException if a nationality is not found', async () => {
      const createArtistDto = {
        name: 'Artist 1',
        bio: 'Artist 1 bio',
        birthday: new Date('1990-01-01'),
        jobs_ids: [1],
        nationalities_ids: [99],
      };
      const imageName = 'artist1.jpg';

      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(mockData.jobs[0]);
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Nationalité 99 introuvable'));

      await expect(service.create(createArtistDto, imageName)).rejects.toThrow(
        new NotFoundException('Nationalité 99 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createArtistDto = {
        name: 'Artist 1',
        bio: 'Artist 1 bio',
        birthday: new Date('1990-01-01'),
        jobs_ids: [1],
        nationalities_ids: [1],
      };
      const imageName = 'artist1.jpg';

      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(mockData.jobs[0]);
      jest
        .spyOn(nationalitiesService, 'findOneById')
        .mockResolvedValue(mockData.nationalities[0]);

      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createArtistDto, imageName)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an arrray of artists', async () => {
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(mockResult);
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAll()).rejects.toThrow(
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
