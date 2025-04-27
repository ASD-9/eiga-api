import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { NationalitiesModule } from '../nationalities/nationalities.module';
import { CategoriesModule } from '../categories/categories.module';
import { SagasModule } from '../sagas/sagas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    SagasModule,
    CategoriesModule,
    NationalitiesModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
