import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';
import { MockFactory } from './mock-factory';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Movie } from '../src/movies/entities/movie.entity';
import { Artist } from '../src/artists/entities/artist.entity';
import { Job } from '../src/jobs/entities/job.entity';
import { MovieArtistJobModule } from '../src/movie-artist-job/movie-artist-job.module';
import { MovieArtistJob } from '../src/movie-artist-job/entities/movie-artist-job.entity';
import { MovieArtistJobResponseDto } from '../src/movie-artist-job/dto/movie-artist-job-response.dto';
import { Saga } from '../src/sagas/entities/saga.entity';
import { Nationality } from '../src/nationalities/entities/nationality.entity';
import { Category } from '../src/categories/entities/category.entity';

describe('MovieArtistJob', () => {
  let app: INestApplication;
  let repository: Repository<MovieArtistJob>;
  let moviesRepository: Repository<Movie>;
  let artistsRepository: Repository<Artist>;
  let jobsRepository: Repository<Job>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MovieArtistJobModule],
    })
      .overrideProvider(getRepositoryToken(MovieArtistJob))
      .useValue({
        save: jest.fn(),
        delete: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Movie))
      .useValue({ findOne: jest.fn() })
      .overrideProvider(getRepositoryToken(Artist))
      .useValue({ findOne: jest.fn() })
      .overrideProvider(getRepositoryToken(Job))
      .useValue({ findOneBy: jest.fn() })
      .overrideProvider(getRepositoryToken(Saga))
      .useValue({})
      .overrideProvider(getRepositoryToken(Nationality))
      .useValue({})
      .overrideProvider(getRepositoryToken(Category))
      .useValue({})
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

    repository = moduleRef.get<Repository<MovieArtistJob>>(
      getRepositoryToken(MovieArtistJob),
    );
    moviesRepository = moduleRef.get<Repository<Movie>>(
      getRepositoryToken(Movie),
    );
    artistsRepository = moduleRef.get<Repository<Artist>>(
      getRepositoryToken(Artist),
    );
    jobsRepository = moduleRef.get<Repository<Job>>(getRepositoryToken(Job));
  });

  describe('/movie-artist-job (POST)', () => {
    it('should create a movie-artist-job relation and return it with status 201', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();
      const mockData = MockFactory.createMockMovieArtistJob();

      jest.spyOn(moviesRepository, 'findOne').mockResolvedValue(mockData.movie);
      jest
        .spyOn(artistsRepository, 'findOne')
        .mockResolvedValue(mockData.artist);
      jest.spyOn(jobsRepository, 'findOneBy').mockResolvedValue(mockData.job);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      const responseData = plainToInstance(MovieArtistJobResponseDto, mockData);

      return request(app.getHttpServer() as App)
        .post('/movie-artist-job')
        .send(createMovieArtistJobDto)
        .expect(201)
        .expect(instanceToPlain(responseData));
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          movie_id: -1,
        });

      return request(app.getHttpServer() as App)
        .post('/movie-artist-job')
        .send(createMovieArtistJobDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ["L'id du film doit être un entier positif"],
        });
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          movie_id: 99,
        });

      jest.spyOn(moviesRepository, 'findOne').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/movie-artist-job')
        .send(createMovieArtistJobDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Film 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          artist_id: 99,
        });
      const movie = MockFactory.createMockMovie();

      jest.spyOn(moviesRepository, 'findOne').mockResolvedValue(movie);
      jest.spyOn(artistsRepository, 'findOne').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/movie-artist-job')
        .send(createMovieArtistJobDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Artiste 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw NotFoundException if the job is not found', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          job_id: 99,
        });
      const mockData = MockFactory.createMockMovieArtistJob();

      jest.spyOn(moviesRepository, 'findOne').mockResolvedValue(mockData.movie);
      jest
        .spyOn(artistsRepository, 'findOne')
        .mockResolvedValue(mockData.artist);
      jest.spyOn(jobsRepository, 'findOneBy').mockResolvedValue(null);

      return request(app.getHttpServer() as App)
        .post('/movie-artist-job')
        .send(createMovieArtistJobDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Métier 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();
      const mockData = MockFactory.createMockMovieArtistJob();

      jest.spyOn(moviesRepository, 'findOne').mockResolvedValue(mockData.movie);
      jest
        .spyOn(artistsRepository, 'findOne')
        .mockResolvedValue(mockData.artist);
      jest.spyOn(jobsRepository, 'findOneBy').mockResolvedValue(mockData.job);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .post('/movie-artist-job')
        .send(createMovieArtistJobDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/movie-artist-job (DELETE)', () => {
    it('should delete the movie-artist-job relation and return status 204', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/movie-artist-job')
        .send(deleteMovieArtistJobDto)
        .expect(204);
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          movie_id: -1,
        });

      return request(app.getHttpServer() as App)
        .delete('/movie-artist-job')
        .send(deleteMovieArtistJobDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ["L'id du film doit être un entier positif"],
        });
    });

    it('should throw NotFoundException if the movie-artist-job relation is not found', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          movie_id: 99,
          artist_id: 99,
          job_id: 99,
        });

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/movie-artist-job')
        .send(deleteMovieArtistJobDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: `Relation entre film 99, artiste 99 et métier 99 introuvable`,
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();

      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .delete('/movie-artist-job')
        .send(deleteMovieArtistJobDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });
});
