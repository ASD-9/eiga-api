import { Test, TestingModule } from '@nestjs/testing';
import { NationalitiesController } from './nationalities.controller';
import { NationalitiesService } from './nationalities.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Nationality } from './entities/nationality.entity';
import { plainToInstance } from 'class-transformer';
import { NationalityResponseDto } from './dto/nationality-response.dto';

const mockData = plainToInstance(NationalityResponseDto, {
  id: 1,
  name: 'Nationality 1',
});

const mockData2 = plainToInstance(NationalityResponseDto, {
  id: 2,
  name: 'Nationality 2',
});

describe('NationalitiesController', () => {
  let controller: NationalitiesController;
  let service: NationalitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NationalitiesController],
      providers: [
        NationalitiesService,
        {
          provide: getRepositoryToken(Nationality),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<NationalitiesController>(NationalitiesController);
    service = module.get<NationalitiesService>(NationalitiesService);
  });

  describe('create', () => {
    it('should return the created nationality', async () => {
      const createNationalityDto = { name: 'Nationality 1' };
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      expect(await controller.create(createNationalityDto)).toEqual(mockData);
    });
  });

  describe('findAll', () => {
    it('should return an array of nationalities', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.findAll()).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should return status 204 if the nationality is successfully updated', async () => {
      const id = 1;
      const updateNationalityDto = { name: 'Nationality 1' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateNationalityDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the nationality is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
