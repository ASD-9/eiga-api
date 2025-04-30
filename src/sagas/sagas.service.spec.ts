import { Test, TestingModule } from '@nestjs/testing';
import { SagasService } from './sagas.service';
import { DeleteResult, Repository } from 'typeorm';
import { Saga } from './entities/saga.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SagaResponseDto } from './dto/saga-response.dto';
import { MockFactory } from '../../test/mock-factory';

describe('SagasService', () => {
  let service: SagasService;
  let repository: Repository<Saga>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SagasService,
        {
          provide: getRepositoryToken(Saga),
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

    service = module.get<SagasService>(SagasService);
    repository = module.get<Repository<Saga>>(getRepositoryToken(Saga));
  });

  describe('create', () => {
    it('should create a new saga and return it', async () => {
      const createSagaDto = { name: 'Saga 1' };
      const mockData = MockFactory.createMockSaga();
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createSagaDto)).toEqual(
        plainToInstance(SagaResponseDto, mockData),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createSagaDto = { name: 'Saga 1' };
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create(createSagaDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of sagas', async () => {
      const mockResult = [
        MockFactory.createMockSaga(),
        MockFactory.createMockSaga({ id: 2 }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(
        plainToInstance(SagaResponseDto, mockResult),
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
    it('should return the saga with the given id', async () => {
      const mockData = MockFactory.createMockSaga();
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockData);

      expect(await service.findOneById(id)).toEqual(
        plainToInstance(SagaResponseDto, mockData),
      );
    });

    it('should thrown NotFoundException if the saga is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`Saga ${id} introuvable`),
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
    it('should update the saga with the given id', async () => {
      const id = 1;
      const updateSagaDto = { name: 'Saga 1' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateSagaDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateSagaDto);
    });

    it('should throw NotFoundException if the saga is not found', async () => {
      const id = 99;
      const updateSagaDto = { name: 'Saga 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateSagaDto)).rejects.toThrow(
        new NotFoundException(`Saga ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateSagaDto = { name: 'Saga 1' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateSagaDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the saga with the given id', async () => {
      const id = 1;
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if the saga is not found', async () => {
      const id = 99;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Saga ${id} introuvable`),
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
