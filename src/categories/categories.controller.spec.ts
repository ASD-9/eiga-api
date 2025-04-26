import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

const mockData = {
  id: 1,
  name: 'Category 1',
};

const mockData2 = {
  id: 2,
  name: 'Category 2',
};

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should return the created category', async () => {
      const createCategoryDto = { name: 'Category 1' };
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      expect(await controller.create(createCategoryDto)).toEqual(mockData);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.findAll()).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should return status 204 if the category is successfully updated', async () => {
      const id = 1;
      const updateCategoryDto = { name: 'Category 1' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateCategoryDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the category is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
