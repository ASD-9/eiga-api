import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { JobsModule } from '../src/jobs/jobs.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from '../src/jobs/entities/job.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';

const mockData = {
  id: 1,
  name: 'Job 1',
};

const mockData2 = {
  id: 2,
  name: 'Job 2',
};

describe('Jobs', () => {
  let app: INestApplication;
  let repository: Repository<Job>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JobsModule],
    })
      .overrideProvider(getRepositoryToken(Job))
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

    repository = moduleRef.get<Repository<Job>>(getRepositoryToken(Job));
  });

  describe('/jobs (POST)', () => {
    it('should create a new job and return it with status 201', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(mockData as Job);

      const createJobDto = {
        name: 'Job 1',
      };

      return request(app.getHttpServer() as App)
        .post('/jobs')
        .send(createJobDto)
        .expect(201)
        .expect(mockData);
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createJobDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .post('/jobs')
        .send(createJobDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le nom du métier doit être une chaîne de caractères'],
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      const createJobDto = {
        name: 'Job 1',
      };

      return request(app.getHttpServer() as App)
        .post('/jobs')
        .send(createJobDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/jobs (GET)', () => {
    it('should return all jobs with status 200', async () => {
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult as Job[]);

      return request(app.getHttpServer() as App)
        .get('/jobs')
        .expect(200)
        .expect(mockResult);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/jobs')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/jobs/:id (PATCH)', () => {
    it('should update the job with the given id', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      const updateJobDto = { name: 'Job 1' };

      return request(app.getHttpServer() as App)
        .patch('/jobs/1')
        .send(updateJobDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      const updateJobDto = { name: 'Job 1' };

      return request(app.getHttpServer() as App)
        .patch('/jobs/abc')
        .send(updateJobDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateJobDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .patch('/jobs/1')
        .send(updateJobDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le nom du métier doit être une chaîne de caractères'],
        });
    });

    it('should throw NotFoundException if the job is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      const updateJobDto = { name: 'Job 1' };

      return request(app.getHttpServer() as App)
        .patch('/jobs/99')
        .send(updateJobDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Métier 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      const updateJobDto = { name: 'Job 1' };

      return request(app.getHttpServer() as App)
        .patch('/jobs/1')
        .send(updateJobDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/jobs/:id (DELETE)', () => {
    it('should delete the job with the given id', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/jobs/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/jobs/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the job is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/jobs/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Métier 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .delete('/jobs/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
