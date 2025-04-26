import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { NationalitiesModule } from '../src/nationalities/nationalities.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Nationality } from '../src/nationalities/entities/nationality.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';

const mockData = {
  id: 1,
  name: 'Nationality 1',
};

const mockData2 = {
  id: 2,
  name: 'Nationality 2',
};

describe('Nationalities', () => {
  let app: INestApplication;
  let repository: Repository<Nationality>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NationalitiesModule],
    })
      .overrideProvider(getRepositoryToken(Nationality))
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

    repository = moduleRef.get<Repository<Nationality>>(
      getRepositoryToken(Nationality),
    );
  });

  describe('/nationalities (POST)', () => {
    it('should create a new nationality and return it with status 201', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      const createNationalityDto = {
        name: 'Nationality 1',
      };

      return request(app.getHttpServer() as App)
        .post('/nationalities')
        .send(createNationalityDto)
        .expect(201)
        .expect(mockData);
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createNationalityDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .post('/nationalities')
        .send(createNationalityDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom de la nationalité doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      const createNationalityDto = {
        name: 'Nationality 1',
      };

      return request(app.getHttpServer() as App)
        .post('/nationalities')
        .send(createNationalityDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/nationalities (GET)', () => {
    it('should return all nationalities with status 200', async () => {
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      return request(app.getHttpServer() as App)
        .get('/nationalities')
        .expect(200)
        .expect(mockResult);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/nationalities')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/nationalities/:id (PATCH)', () => {
    it('should update the nationality with the given id', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      const updateNationalityDto = { name: 'Nationality 1' };

      return request(app.getHttpServer() as App)
        .patch('/nationalities/1')
        .send(updateNationalityDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      const updateNationalityDto = { name: 'Nationality 1' };

      return request(app.getHttpServer() as App)
        .patch('/nationalities/abc')
        .send(updateNationalityDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateNationalityDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .patch('/nationalities/1')
        .send(updateNationalityDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom de la nationalité doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw NotFoundException if the nationality is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      const updateNationalityDto = { name: 'Nationality 1' };

      return request(app.getHttpServer() as App)
        .patch('/nationalities/99')
        .send(updateNationalityDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Nationalité 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      const updateNationalityDto = { name: 'Nationality 1' };

      return request(app.getHttpServer() as App)
        .patch('/nationalities/1')
        .send(updateNationalityDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/nationalities/:id (DELETE)', () => {
    it('should delete the nationality with the given id', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/nationalities/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/nationalities/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the nationality is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/nationalities/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Nationalité 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .delete('/nationalities/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
