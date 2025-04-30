import { Test, TestingModule } from '@nestjs/testing';
import { MovieArtistJobController } from './movie-artist-job.controller';
import { MovieArtistJobService } from './movie-artist-job.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovieArtistJob } from './entities/movie-artist-job.entity';
import { MoviesService } from '../movies/movies.service';
import { ArtistsService } from '../artists/artists.service';
import { JobsService } from '../jobs/jobs.service';
import { MockFactory } from '../../test/mock-factory';
import { plainToInstance } from 'class-transformer';
import { MovieArtistJobResponseDto } from './dto/movie-artist-job-response.dto';

describe('MovieArtistJobController', () => {
  let controller: MovieArtistJobController;
  let service: MovieArtistJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieArtistJobController],
      providers: [
        MovieArtistJobService,
        {
          provide: getRepositoryToken(MovieArtistJob),
          useValue: {},
        },
        {
          provide: MoviesService,
          useValue: {},
        },
        {
          provide: ArtistsService,
          useValue: {},
        },
        {
          provide: JobsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MovieArtistJobController>(MovieArtistJobController);
    service = module.get<MovieArtistJobService>(MovieArtistJobService);
  });

  describe('create', () => {
    it('should return the created movie-artist-job relation', async () => {
      const createMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();
      const mockData = plainToInstance(
        MovieArtistJobResponseDto,
        MockFactory.createMockMovieArtistJob(),
      );
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      expect(await controller.create(createMovieArtistJobDto)).toEqual(
        mockData,
      );
    });
  });

  describe('delete', () => {
    it('should return status 204 if the movie-artist-job relation is successfully deleted', async () => {
      const deleteMovieArtistJobDto =
        MockFactory.createMockActionMovieArtistJobDto();
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(deleteMovieArtistJobDto)).toBeUndefined();
    });
  });
});
