import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesModule } from '../src/categories/categories.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../src/categories/entities/category.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';
import { MockFactory } from './mock-factory';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from '../src/categories/dto/category-response.dto';

describe('Categories', () => {
  let app: INestApplication;
  let repository: Repository<Category>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CategoriesModule],
    })
      .overrideProvider(getRepositoryToken(Category))
      .useValue({
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors: ValidationError[]) => {
          return new BadRequestException({
            message: 'Erreur de validation',
            details: errors.flatMap((error) =>
              Object.values(error.constraints ?? {}),
            ),
          });
        },
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get('Reflector')),
    );
    await app.init();

    repository = moduleRef.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  describe('/categories (POST)', () => {
    it('should create a new category and return it with status 201', async () => {
      const createCategoryDto = {
        name: 'Category 1',
      };
      const mockData = MockFactory.createMockCategory();

      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      const responseData = plainToInstance(CategoryResponseDto, mockData);

      return request(app.getHttpServer() as App)
        .post('/categories')
        .send(createCategoryDto)
        .expect(201)
        .expect(instanceToPlain(responseData));
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createCategoryDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .post('/categories')
        .send(createCategoryDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom de la catégorie doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      const createCategoryDto = {
        name: 'Category 1',
      };

      return request(app.getHttpServer() as App)
        .post('/categories')
        .send(createCategoryDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/categories (GET)', () => {
    it('should return all categories with status 200', async () => {
      const mockResult = [
        MockFactory.createMockCategory(),
        MockFactory.createMockCategory({ id: 2 }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      const responseData = plainToInstance(CategoryResponseDto, mockResult);

      return request(app.getHttpServer() as App)
        .get('/categories')
        .expect(200)
        .expect(instanceToPlain(responseData));
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/categories')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/categories/:id (PATCH)', () => {
    it('should update the category with the given id', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      const updateCategoryDto = { name: 'Category 1' };

      return request(app.getHttpServer() as App)
        .patch('/categories/1')
        .send(updateCategoryDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      const updateCategoryDto = { name: 'Category 1' };

      return request(app.getHttpServer() as App)
        .patch('/categories/abc')
        .send(updateCategoryDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateCategoryDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .patch('/categories/1')
        .send(updateCategoryDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom de la catégorie doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw NotFoundException if the category is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      const updateCategoryDto = { name: 'Category 1' };

      return request(app.getHttpServer() as App)
        .patch('/categories/99')
        .send(updateCategoryDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Catégorie 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      const updateCategoryDto = { name: 'Category 1' };

      return request(app.getHttpServer() as App)
        .patch('/categories/1')
        .send(updateCategoryDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should delete the category with the given id', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/categories/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/categories/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the category is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/categories/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Catégorie 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .delete('/categories/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
