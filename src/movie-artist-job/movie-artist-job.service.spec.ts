import { Test, TestingModule } from '@nestjs/testing';
import { MovieArtistJobService } from './movie-artist-job.service';
import { DeleteResult, Repository } from 'typeorm';
import { MovieArtistJob } from './entities/movie-artist-job.entity';
import { MoviesService } from '../movies/movies.service';
import { ArtistsService } from '../artists/artists.service';
import { JobsService } from '../jobs/jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockFactory } from '../../test/mock-factory';
import { MovieLightResponseDto } from '../movies/dto/movie-light-response.dto';
import { plainToInstance } from 'class-transformer';
import { ArtistLightResponseDto } from '../artists/dto/artist-light-response.dto';
import { JobResponseDto } from '../jobs/dto/job-response.dto';
import { MovieArtistJobResponseDto } from './dto/movie-artist-job-response.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('MovieArtistJobService', () => {
  let service: MovieArtistJobService;
  let repository: Repository<MovieArtistJob>;
  let moviesService: MoviesService;
  let artistsService: ArtistsService;
  let jobsService: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieArtistJobService,
        {
          provide: getRepositoryToken(MovieArtistJob),
          useValue: {
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: MoviesService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: ArtistsService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: JobsService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovieArtistJobService>(MovieArtistJobService);
    repository = module.get<Repository<MovieArtistJob>>(
      getRepositoryToken(MovieArtistJob),
    );
    moviesService = module.get<MoviesService>(MoviesService);
    artistsService = module.get<ArtistsService>(ArtistsService);
    jobsService = module.get<JobsService>(JobsService);
  });

  describe('create', () => {
    it('should create a new movie artist job relation and return it', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();
      const mockData = MockFactory.createMockMovieArtistJob();

      jest
        .spyOn(moviesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(MovieLightResponseDto, mockData.movie),
        );
      jest
        .spyOn(artistsService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(ArtistLightResponseDto, mockData.artist),
        );
      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(plainToInstance(JobResponseDto, mockData.job));
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createMovieArtistJobDto)).toEqual(
        plainToInstance(MovieArtistJobResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the movie is not found', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          movie_id: 99,
        });

      jest
        .spyOn(moviesService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Film 99 introuvable'));

      await expect(service.create(createMovieArtistJobDto)).rejects.toThrow(
        new NotFoundException('Film 99 introuvable'),
      );
    });

    it('should throw NotFoundException if the artist is not found', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          artist_id: 99,
        });
      const movie = MockFactory.createMockMovie();

      jest
        .spyOn(moviesService, 'findOneById')
        .mockResolvedValue(plainToInstance(MovieLightResponseDto, movie));
      jest
        .spyOn(artistsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Artiste 99 introuvable'));

      await expect(service.create(createMovieArtistJobDto)).rejects.toThrow(
        new NotFoundException('Artiste 99 introuvable'),
      );
    });

    it('should throw NotFoundException if the job is not found', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          job_id: 99,
        });
      const mockData = MockFactory.createMockMovieArtistJob();

      jest
        .spyOn(moviesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(MovieLightResponseDto, mockData.movie),
        );
      jest
        .spyOn(artistsService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(ArtistLightResponseDto, mockData.artist),
        );
      jest
        .spyOn(jobsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Métier 99 introuvable'));

      await expect(service.create(createMovieArtistJobDto)).rejects.toThrow(
        new NotFoundException('Métier 99 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();
      const mockData = MockFactory.createMockMovieArtistJob();

      jest
        .spyOn(moviesService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(MovieLightResponseDto, mockData.movie),
        );
      jest
        .spyOn(artistsService, 'findOneById')
        .mockResolvedValue(
          plainToInstance(ArtistLightResponseDto, mockData.artist),
        );
      jest
        .spyOn(jobsService, 'findOneById')
        .mockResolvedValue(plainToInstance(JobResponseDto, mockData.job));
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createMovieArtistJobDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('delete', () => {
    it('should delete the movie artist job relation with the given ids', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();

      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(deleteMovieArtistJobDto);

      expect(mockDelete).toHaveBeenCalledWith({
        movie: { id: deleteMovieArtistJobDto.movie_id },
        artist: { id: deleteMovieArtistJobDto.artist_id },
        job: { id: deleteMovieArtistJobDto.job_id },
      });
    });

    it('should throw NotFoundException if the movie artist job relation is not found', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto({
          movie_id: 99,
          artist_id: 99,
          job_id: 99,
        });

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(deleteMovieArtistJobDto)).rejects.toThrow(
        new NotFoundException(
          `Relation entre film ${deleteMovieArtistJobDto.movie_id}, artiste ${deleteMovieArtistJobDto.artist_id} et métier ${deleteMovieArtistJobDto.job_id} introuvable`,
        ),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();

      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      await expect(service.remove(deleteMovieArtistJobDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });
});
