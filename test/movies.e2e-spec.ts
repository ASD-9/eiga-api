import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { MoviesModule } from '../src/movies/movies.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';
import { Saga } from '../src/sagas/entities/saga.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Nationality } from '../src/nationalities/entities/nationality.entity';
import { join } from 'path';
import * as fs from 'fs';
import { MockFactory } from './mock-factory';
import { MovieLightResponseDto } from '../src/movies/dto/movie-light-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { MovieResponseDto } from '../src/movies/dto/movie-response.dto';

describe('Movies', () => {
  let app: INestApplication;
  let repository: Repository<Movie>;
  let sagasRepository: Repository<Saga>;
  let categoriesRepository: Repository<Category>;
  let nationalitiesRepository: Repository<Nationality>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MoviesModule],
    })
      .overrideProvider(getRepositoryToken(Movie))
      .useValue({
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Saga))
      .useValue({ findOneBy: jest.fn() })
      .overrideProvider(getRepositoryToken(Category))
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

    repository = moduleRef.get<Repository<Movie>>(getRepositoryToken(Movie));
    sagasRepository = moduleRef.get<Repository<Saga>>(getRepositoryToken(Saga));
    categoriesRepository = moduleRef.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    nationalitiesRepository = moduleRef.get<Repository<Nationality>>(
      getRepositoryToken(Nationality),
    );
  });

  describe('/movies (POST)', () => {
    afterEach(() => {
      const testPattern = new RegExp(
        `movie-${Date.now().toString().substring(0, 9)}`,
      );

      fs.readdirSync(join(process.cwd(), 'public', 'movies', 'images')).forEach(
        (file) => {
          if (testPattern.test(file)) {
            fs.unlinkSync(
              join(process.cwd(), 'public', 'movies', 'images', file),
            );
          }
        },
      );

      fs.readdirSync(join(process.cwd(), 'public', 'movies', 'videos')).forEach(
        (file) => {
          if (testPattern.test(file)) {
            fs.unlinkSync(
              join(process.cwd(), 'public', 'movies', 'videos', file),
            );
          }
        },
      );
    });

    it('should upload a movie with his image, create and return it', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData();
      const mockData = MockFactory.createMockMovie();

      jest.spyOn(sagasRepository, 'findOneBy').mockResolvedValue(mockData.saga);
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(mockData.categories[0]);
      jest
        .spyOn(nationalitiesRepository, 'findOneBy')
        .mockResolvedValue(mockData.nationalities[0]);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      const responseData = plainToInstance(MovieLightResponseDto, mockData);

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(201)
        .expect(instanceToPlain(responseData))
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw BadRequestException if the mime type of the video is not supported', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.txt');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData();

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Type de fichier non autorisé. Types acceptés: video/mp4',
          error: 'Bad Request',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw BadRequestException if the mime type of the image is not supported', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.txt');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData();

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(400)
        .expect({
          statusCode: 400,
          message:
            'Type de fichier non autorisé. Types acceptés: image/jpeg, image/png',
          error: 'Bad Request',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw InternalServerErrorException if no video is uploaded', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData();

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
        });
    });

    it('should throw InternalServerErrorException if no image is uploaded', async () => {
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData();

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .field(createMovieFormData)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        })
        .then(() => {
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData({
        nationalities_ids: [],
      });

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Les nationalités doivent être positifs',
            'Les nationalités doivent être des entiers',
            'Le film doit avoir au moins une nationalité',
          ],
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw NotFoundException if the saga is not found', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData({
        saga_id: 99,
      });

      jest.spyOn(sagasRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Saga 99 introuvable',
          error: 'Not Found',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw NotFoundException if a category is not found', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData({
        categories_ids: 99,
      });
      const saga = MockFactory.createMockSaga();

      jest.spyOn(sagasRepository, 'findOneBy').mockResolvedValue(saga);
      jest.spyOn(categoriesRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Catégorie 99 introuvable',
          error: 'Not Found',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw NotFoundException if a nationality is not found', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData({
        nationalities_ids: 99,
      });
      const mockData = MockFactory.createMockMovie();

      jest.spyOn(sagasRepository, 'findOneBy').mockResolvedValue(mockData.saga);
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(mockData.categories[0]);
      jest.spyOn(nationalitiesRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Nationalité 99 introuvable',
          error: 'Not Found',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const testImageFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      const testVideoFilePath = join(process.cwd(), 'tmp', 'test.mp4');
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      const createMovieFormData = MockFactory.createMockCreateMovieFormData();
      const mockData = MockFactory.createMockMovie();

      jest.spyOn(sagasRepository, 'findOneBy').mockResolvedValue(mockData.saga);
      jest
        .spyOn(categoriesRepository, 'findOneBy')
        .mockResolvedValue(mockData.categories[0]);
      jest
        .spyOn(nationalitiesRepository, 'findOneBy')
        .mockResolvedValue(mockData.nationalities[0]);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .post('/movies')
        .attach('video', testVideoFilePath)
        .attach('image', testImageFilePath)
        .field(createMovieFormData)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        })
        .then(() => {
          fs.unlinkSync(testImageFilePath);
          fs.unlinkSync(testVideoFilePath);
        });
    });
  });

  describe('/movies (GET)', () => {
    it('should return all movies with status 200', async () => {
      const result = [
        MockFactory.createMockMovie({
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
        MockFactory.createMockMovie({
          id: 2,
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      const responseData = plainToInstance(MovieLightResponseDto, result);

      return request(app.getHttpServer() as App)
        .get('/movies')
        .expect(200)
        .expect(instanceToPlain(responseData));
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/movies')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/movies/profil/:profilId (GET)', () => {
    it('should return all movies with profilId with status 200', async () => {
      const result = [
        MockFactory.createMockMovie({
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
        MockFactory.createMockMovie({
          id: 2,
          synopsis: undefined,
          duration: undefined,
          trailer_url: undefined,
          release_date: undefined,
          video_name: undefined,
          saga: undefined,
          categories: undefined,
          nationalities: undefined,
          profils: undefined,
        }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      const responseData = plainToInstance(MovieLightResponseDto, result);

      return request(app.getHttpServer() as App)
        .get('/movies/profil/1')
        .expect(200)
        .expect(instanceToPlain(responseData));
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .get('/movies/profil/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/movies/profil/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/movies/:id (GET)', () => {
    it('should return the movie with the given id with status 200', async () => {
      const mockData = MockFactory.createMockMovie();
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockData);

      const responseData = plainToInstance(MovieResponseDto, {
        ...mockData,
        release_date: '2014-01-01T00:00:00.000Z',
      });

      return request(app.getHttpServer() as App)
        .get('/movies/1')
        .expect(200)
        .expect(instanceToPlain(responseData));
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .get('/movies/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .get('/movies/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Film 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .get('/movies/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/movies/:id (PATCH)', () => {
    it('should return status 204 if the movie is successfully updated', async () => {
      const updateMovieDto = { title: 'Movie 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      return request(app.getHttpServer() as App)
        .patch('/movies/1')
        .send(updateMovieDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .patch('/movies/abc')
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateMovieDto = { title: 2 };
      return request(app.getHttpServer() as App)
        .patch('/movies/1')
        .send(updateMovieDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le titre du film doit être une chaîne de caractères'],
        });
    });

    it('should throw NotFoundException if the sage is not found', async () => {
      const updateMovieDto = { saga_id: 99 };
      jest.spyOn(sagasRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .patch('/movies/1')
        .send(updateMovieDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Saga 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const updateMovieDto = { title: 'Movie 1' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      return request(app.getHttpServer() as App)
        .patch('/movies/99')
        .send(updateMovieDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Film 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const updateMovieDto = { title: 'Movie 1' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .patch('/movies/1')
        .send(updateMovieDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/movies/:id (DELETE)', () => {
    it('should delete the movie with the given id and his image and video and return status 204', async () => {
      const testImageFilePath = join(
        process.cwd(),
        'public',
        'movies',
        'images',
        'image1.jpg',
      );
      const testVideoFilePath = join(
        process.cwd(),
        'public',
        'movies',
        'videos',
        'video1.mp4',
      );
      fs.writeFileSync(testImageFilePath, Buffer.alloc(1024));
      fs.writeFileSync(testVideoFilePath, Buffer.alloc(1024));

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        image_name: 'image1.jpg',
        video_name: 'video1.mp4',
      } as Movie);
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      const res = await request(app.getHttpServer() as App).delete('/movies/1');

      expect(res.status).toBe(204);
      expect(fs.existsSync(testImageFilePath)).toBe(false);
      expect(fs.existsSync(testVideoFilePath)).toBe(false);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/movies/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .delete('/movies/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Film 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        image_name: 'image1.jpg',
        video_name: 'video1.mp4',
      } as Movie);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer() as App)
        .delete('/movies/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
