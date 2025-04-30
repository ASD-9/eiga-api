import { Test, TestingModule } from '@nestjs/testing';
import { NationalitiesService } from './nationalities.service';
import { DeleteResult, Repository } from 'typeorm';
import { Nationality } from './entities/nationality.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { NationalityResponseDto } from './dto/nationality-response.dto';
import { MockFactory } from '../../test/mock-factory';

describe('NationalitiesService', () => {
  let service: NationalitiesService;
  let repository: Repository<Nationality>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NationalitiesService,
        {
          provide: getRepositoryToken(Nationality),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NationalitiesService>(NationalitiesService);
    repository = module.get<Repository<Nationality>>(
      getRepositoryToken(Nationality),
    );
  });

  describe('create', () => {
    it('should create a new nationality and return it', async () => {
      const createNationalityDto = { name: 'Nationality 1' };
      const mockData = MockFactory.createMockNationality();
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createNationalityDto)).toEqual(
        plainToInstance(NationalityResponseDto, mockData),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createNationalityDto = { name: 'Nationality 1' };
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create(createNationalityDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of nationalities', async () => {
      const mockResult = [
        MockFactory.createMockNationality(),
        MockFactory.createMockNationality({ id: 2 }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(
        plainToInstance(NationalityResponseDto, mockResult),
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
    it('should return the nationality with the given id', async () => {
      const mockData = MockFactory.createMockNationality();
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockData);

      expect(await service.findOneById(id)).toEqual(
        plainToInstance(NationalityResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the nationality is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`Nationalité ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error('Error'));

      await expect(service.findOneById(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('update', () => {
    it('should update the nationality with the given id', async () => {
      const id = 1;
      const updateNationalityDto = { name: 'Nationality 1' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateNationalityDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateNationalityDto);
    });

    it('should throw NotFoundException if the nationality is not found', async () => {
      const id = 99;
      const updateNationalityDto = { name: 'Nationality 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateNationalityDto)).rejects.toThrow(
        new NotFoundException(`Nationalité ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateNationalityDto = { name: 'Nationality 1' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateNationalityDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the nationality with the given id', async () => {
      const id = 1;
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if the nationality is not found', async () => {
      const id = 99;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Nationalité ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      await expect(service.remove(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });
});
