import { Test, TestingModule } from '@nestjs/testing';
import { SagasController } from './sagas.controller';
import { SagasService } from './sagas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Saga } from './entities/saga.entity';
import { SagaResponseDto } from './dto/saga-response.dto';
import { MockFactory } from '../../test/mock-factory';
import { plainToInstance } from 'class-transformer';

describe('SagasController', () => {
  let controller: SagasController;
  let service: SagasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SagasController],
      providers: [
        SagasService,
        {
          provide: getRepositoryToken(Saga),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SagasController>(SagasController);
    service = module.get<SagasService>(SagasService);
  });

  describe('create', () => {
    it('should return the created saga', async () => {
      const createSagaDto = { name: 'Saga 1' };
      const mockData = plainToInstance(
        SagaResponseDto,
        MockFactory.createMockSaga(),
      );
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      expect(await controller.create(createSagaDto)).toEqual(mockData);
    });
  });

  describe('findAll', () => {
    it('should return an array of sagas', async () => {
      const mockResult = plainToInstance(SagaResponseDto, [
        MockFactory.createMockSaga(),
        MockFactory.createMockSaga({ id: 2 }),
      ]);
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.findAll()).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should return status 204 if the saga is successfully updated', async () => {
      const id = 1;
      const updateSagaDto = { name: 'Saga 1' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateSagaDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the saga is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
