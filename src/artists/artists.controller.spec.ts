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
import { MockFactory } from '../../test/mock-factory';

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
      const createArtistDto = MockFactory.createMockCreateArtistDto();
      const file = { filename: 'artist1.jpg' };
      const mockData = plainToInstance(
        ArtistLightResponseDto,
        MockFactory.createMockArtist(),
      );
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(await controller.create(createArtistDto, file as any)).toEqual(
        mockData,
      );
    });

    it('should throw InternalServerErrorException if no file is uploaded', () => {
      const createArtistDto = MockFactory.createMockCreateArtistDto();
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
        MockFactory.createMockArtist(),
        MockFactory.createMockArtist({ id: 2 }),
      ]);
      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);

      expect(await controller.findAll()).toEqual(mockResult);
    });
  });

  describe('findOneById', () => {
    it('should return an artist', async () => {
      const mockData = plainToInstance(
        ArtistResponseDto,
        MockFactory.createMockArtist(),
      );
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockData);

      expect(await controller.findOneById(1)).toEqual(mockData);
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
