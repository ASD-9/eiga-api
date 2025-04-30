import { Module } from '@nestjs/common';
import { MovieArtistJobService } from './movie-artist-job.service';
import { MovieArtistJobController } from './movie-artist-job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieArtistJob } from './entities/movie-artist-job.entity';
import { MoviesModule } from '../movies/movies.module';
import { ArtistsModule } from '../artists/artists.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieArtistJob]),
    MoviesModule,
    ArtistsModule,
    JobsModule,
  ],
  controllers: [MovieArtistJobController],
  providers: [MovieArtistJobService],
})
export class MovieArtistJobModule {}
