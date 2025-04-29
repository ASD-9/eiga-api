import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { DeleteResult, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/category-response.dto';

const mockData = {
  id: 1,
  name: 'Category 1',
};

const mockData2 = {
  id: 2,
  name: 'Category 2',
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
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

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  describe('create', () => {
    it('should create a new category and return it', async () => {
      const createCategoryDto = { name: 'Category 1' };
      jest.spyOn(repository, 'save').mockResolvedValue(mockData as Category);

      expect(await service.create(createCategoryDto)).toEqual(
        plainToInstance(CategoryResponseDto, mockData),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createCategoryDto = { name: 'Category 1' };
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(repository, 'find')
        .mockResolvedValue(mockResult as Category[]);

      expect(await service.findAll()).toEqual(
        plainToInstance(CategoryResponseDto, mockResult),
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
    it('should return the category with the given id', async () => {
      const id = 1;
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockData as Category);

      expect(await service.findOneById(id)).toEqual(
        plainToInstance(CategoryResponseDto, mockData),
      );
    });

    it('should thrown NotFoundException if the category is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`Catégorie ${id} introuvable`),
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
    it('should update the category with the given id', async () => {
      const id = 1;
      const updateCategoryDto = { name: 'Category 1' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateCategoryDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateCategoryDto);
    });

    it('should throw NotFoundException if the category is not found', async () => {
      const id = 99;
      const updateCategoryDto = { name: 'Category 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateCategoryDto)).rejects.toThrow(
        new NotFoundException(`Catégorie ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateCategoryDto = { name: 'Category 1' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateCategoryDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the category with the given id', async () => {
      const id = 1;
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if the category is not found', async () => {
      const id = 99;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Catégorie ${id} introuvable`),
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
