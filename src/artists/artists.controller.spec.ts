import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { JobsService } from '../jobs/jobs.service';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { InternalServerErrorException } from '@nestjs/common';
import { ArtistLightResponseDto } from './dto/artist-light-response.dto';
import { plainToInstance } from 'class-transformer';
import { ArtistResponseDto } from './dto/artist-response';

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
};

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let service: ArtistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
          useValue: {},
        },
        {
          provide: JobsService,
          useValue: {},
        },
        {
          provide: NationalitiesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
    service = module.get<ArtistsService>(ArtistsService);
  });

  describe('create', () => {
    it('should return the created artist', async () => {
      const createArtistDto = {
        name: 'Artist 1',
        bio: 'Artist 1 bio',
        birthday: new Date('1990-01-01'),
        jobs_ids: [1],
        nationalities_ids: [1],
      };
      const file = { filename: 'artist1.jpg' };
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(plainToInstance(ArtistLightResponseDto, mockData));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(await controller.create(createArtistDto, file as any)).toEqual(
        plainToInstance(ArtistLightResponseDto, mockData),
      );
    });

    it('should throw InternalServerErrorException if no file is uploaded', () => {
      const createArtistDto = {
        name: 'Artist 1',
        bio: 'Artist 1 bio',
        birthday: new Date('1990-01-01'),
        jobs_ids: [1],
        nationalities_ids: [1],
      };
      const file = null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => controller.create(createArtistDto, file as any)).toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of artists', async () => {
      const mockResult = plainToInstance(ArtistLightResponseDto, [
        mockData,
        mockData2,
      ]);
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);

      expect(await controller.findAll()).toEqual(mockResult);
    });
  });

  describe('findOneById', () => {
    it('should return an artist', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValue(plainToInstance(ArtistResponseDto, mockData));

      expect(await controller.findOneById(1)).toEqual(
        plainToInstance(ArtistResponseDto, mockData),
      );
    });
  });

  describe('update', () => {
    it('should return status 204 if the artist is successfully updated', async () => {
      const id = 1;
      const updateArtistDto = { name: 'Artist 1' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateArtistDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the artist is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
