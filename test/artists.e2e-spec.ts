import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ArtistsModule } from '../src/artists/artists.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Artist } from '../src/artists/entities/artist.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';
import { Job } from '../src/jobs/entities/job.entity';
import { Nationality } from '../src/nationalities/entities/nationality.entity';
import { join } from 'path';
import * as fs from 'fs';
import { MockFactory } from './mock-factory';
import { ArtistLightResponseDto } from '../src/artists/dto/artist-light-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ArtistResponseDto } from '../src/artists/dto/artist-response';

describe('Artists', () => {
  let app: INestApplication;
  let repository: Repository<Artist>;
  let jobsRepository: Repository<Job>;
  let nationalitiesRepository: Repository<Nationality>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ArtistsModule],
    })
      .overrideProvider(getRepositoryToken(Artist))
      .useValue({
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Job))
      .useValue({ findOneBy: jest.fn() })
      .overrideProvider(getRepositoryToken(Nationality))
      .useValue({ findOneBy: jest.fn() })
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

    repository = moduleRef.get<Repository<Artist>>(getRepositoryToken(Artist));
    jobsRepository = moduleRef.get<Repository<Job>>(getRepositoryToken(Job));
    nationalitiesRepository = moduleRef.get<Repository<Nationality>>(
      getRepositoryToken(Nationality),
    );
  });

  describe('/artists (POST)', () => {
    afterEach(() => {
      const testPattern = new RegExp(
        `artist-${Date.now().toString().substring(0, 9)}`,
      );

      fs.readdirSync(join(process.cwd(), 'public', 'artists')).forEach(
        (file) => {
          if (testPattern.test(file)) {
            fs.unlinkSync(join(process.cwd(), 'public', 'artists', file));
          }
        },
      );
    });

    it('should upload & create a new artist and return it', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createArtistFormData = MockFactory.createMockCreateArtistFormData();
      const mockData = MockFactory.createMockArtist();

      jest
        .spyOn(jobsRepository, 'findOneBy')
        .mockResolvedValue(mockData.jobs[0]);
      jest
        .spyOn(nationalitiesRepository, 'findOneBy')
        .mockResolvedValue(mockData.nationalities[0]);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      const responseData = plainToInstance(ArtistLightResponseDto, mockData);

      return request(app.getHttpServer() as App)
        .post('/artists')
        .attach('image', testFilePath)
        .field(createArtistFormData)
        .expect(201)
        .expect(instanceToPlain(responseData))
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw BadRequestException if the mime type is not supported', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.txt');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createArtistFormData = MockFactory.createMockCreateArtistFormData();

      return request(app.getHttpServer() as App)
        .post('/artists')
        .attach('image', testFilePath)
        .field(createArtistFormData)
        .expect(400)
        .expect({
          statusCode: 400,
          message:
            'Type de fichier non autorisé. Types acceptés: image/jpeg, image/png',
          error: 'Bad Request',
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw InternalServerErrorException if no file is uploaded', async () => {
      const createArtistFormData = MockFactory.createMockCreateArtistFormData();

      return request(app.getHttpServer() as App)
        .post('/artists')
        .field(createArtistFormData)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createArtistFormData = MockFactory.createMockCreateArtistFormData({
        nationalities_ids: [],
      });

      return request(app.getHttpServer() as App)
        .post('/artists')
        .attach('image', testFilePath)
        .field(createArtistFormData)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Les nationalités doivent être positifs',
            'Les nationalités doivent être des entiers',
            "L'artiste doit avoir au moins une nationalité",
          ],
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw NotFoundException if a job is not found', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createArtistFormData = MockFactory.createMockCreateArtistFormData({
        jobs_ids: [99],
      });

      jest.spyOn(jobsRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/artists')
        .attach('image', testFilePath)
        .field(createArtistFormData)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Métier 99 introuvable',
          error: 'Not Found',
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw NotFoundException if a nationality is not found', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createArtistFormData = MockFactory.createMockCreateArtistFormData({
        nationalities_ids: [99],
      });
      const job = MockFactory.createMockJob();

      jest.spyOn(jobsRepository, 'findOneBy').mockResolvedValue(job);
      jest.spyOn(nationalitiesRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/artists')
        .attach('image', testFilePath)
        .field(createArtistFormData)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Nationalité 99 introuvable',
          error: 'Not Found',
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createArtistFormData = MockFactory.createMockCreateArtistFormData();
      const mockData = MockFactory.createMockArtist();

      jest
        .spyOn(jobsRepository, 'findOneBy')
        .mockResolvedValue(mockData.jobs[0]);
      jest
        .spyOn(nationalitiesRepository, 'findOneBy')
        .mockResolvedValue(mockData.nationalities[0]);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .post('/artists')
        .attach('image', testFilePath)
        .field(createArtistFormData)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });
  });

  describe('/artists (GET)', () => {
    it('should return all artists with status 200', async () => {
      const result = [
        MockFactory.createMockArtist({
          bio: undefined,
          birthday: undefined,
          jobs: undefined,
          nationalities: undefined,
        }),
        MockFactory.createMockArtist({
          id: 2,
          bio: undefined,
          birthday: undefined,
          jobs: undefined,
          nationalities: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      const responseData = plainToInstance(ArtistLightResponseDto, result);

      return request(app.getHttpServer() as App)
        .get('/artists')
        .expect(200)
        .expect(instanceToPlain(responseData));
    });

    it('should thow InternalServerErrorException if there is an error', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .get('/artists')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/artists/:id (GET)', () => {
    it('should return the artist with given id with status 200', async () => {
      const mockData = MockFactory.createMockArtist();

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockData);

      const responseData = plainToInstance(ArtistResponseDto, mockData);

      return request(app.getHttpServer() as App)
        .get('/artists/1')
        .expect(200)
        .expect(
          instanceToPlain({
            ...responseData,
            birthday: '1990-01-01T00:00:00.000Z',
          }),
        );
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .get('/artists/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .get('/artists/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Artiste 99 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .get('/artists/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/artists/:id (PATCH)', () => {
    it('should return status 204 if the artist is successfully updated', async () => {
      const updateArtistDto = { name: 'Artist 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      return request(app.getHttpServer() as App)
        .patch(`/artists/1`)
        .send(updateArtistDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .patch('/artists/abc')
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateArtistDto = { name: 2 };
      return request(app.getHttpServer() as App)
        .patch(`/artists/1`)
        .send(updateArtistDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ["Le nom de l'artiste doit être une chaîne de caractères"],
        });
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      const updateArtistDto = { name: 'Artist 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      return request(app.getHttpServer() as App)
        .patch(`/artists/99`)
        .send(updateArtistDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Artiste 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if there is an error', async () => {
      const updateArtistDto = { name: 'Artist 1' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .patch(`/artists/1`)
        .send(updateArtistDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/artists/:id (DELETE)', () => {
    it('should delete the artist with the given id and his image and return status 204', async () => {
      const testFilePath = join(
        process.cwd(),
        'public',
        'artists',
        'artist1.jpg',
      );
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ image_name: 'artist1.jpg' } as Artist);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      const res = await request(app.getHttpServer() as App).delete(
        '/artists/1',
      );

      expect(res.status).toBe(204);
      expect(fs.existsSync(testFilePath)).toBe(false);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/artists/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .delete('/artists/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Artiste 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if there is an error', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ image_name: 'artist1.jpg' } as Artist);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .delete('/artists/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
