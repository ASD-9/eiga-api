import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { SagasModule } from '../src/sagas/sagas.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Saga } from '../src/sagas/entities/saga.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';

const mockData = {
  id: 1,
  name: 'Saga 1',
};

const mockData2 = {
  id: 2,
  name: 'Saga 2',
};

describe('Sagas', () => {
  let app: INestApplication;
  let repository: Repository<Saga>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SagasModule],
    })
      .overrideProvider(getRepositoryToken(Saga))
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

    repository = moduleRef.get<Repository<Saga>>(getRepositoryToken(Saga));
  });

  describe('/sagas (POST)', () => {
    it('should create a new saga and return it with status 201', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      const createSageDto = {
        name: 'Saga 1',
      };

      return request(app.getHttpServer() as App)
        .post('/sagas')
        .send(createSageDto)
        .expect(201)
        .expect(mockData);
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createSageDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .post('/sagas')
        .send(createSageDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le nom de la saga doit être une chaîne de caractères'],
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      const createSageDto = {
        name: 'Saga 1',
      };

      return request(app.getHttpServer() as App)
        .post('/sagas')
        .send(createSageDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/sagas (GET)', () => {
    it('should return all sagas with status 200', async () => {
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      return request(app.getHttpServer() as App)
        .get('/sagas')
        .expect(200)
        .expect(mockResult);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/sagas')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/sagas/:id (PATCH)', () => {
    it('should update the saga with the given id', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      const updateSagaDto = { name: 'Saga 1' };

      return request(app.getHttpServer() as App)
        .patch('/sagas/1')
        .send(updateSagaDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      const updateSagaDto = { name: 'Saga 1' };

      return request(app.getHttpServer() as App)
        .patch('/sagas/abc')
        .send(updateSagaDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateSagaDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .patch('/sagas/1')
        .send(updateSagaDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le nom de la saga doit être une chaîne de caractères'],
        });
    });

    it('should throw NotFoundException if the saga is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      const updateSagaDto = { name: 'Saga 1' };

      return request(app.getHttpServer() as App)
        .patch('/sagas/99')
        .send(updateSagaDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Saga 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      const updateSagaDto = { name: 'Saga 1' };

      return request(app.getHttpServer() as App)
        .patch('/sagas/1')
        .send(updateSagaDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/sagas/:id (DELETE)', () => {
    it('should delete the saga with the given id', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/sagas/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/sagas/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the saga is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/sagas/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Saga 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .delete('/sagas/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
