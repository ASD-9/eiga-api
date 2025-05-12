import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { NationalitiesModule } from '../nationalities/nationalities.module';
import { CategoriesModule } from '../categories/categories.module';
import { SagasModule } from '../sagas/sagas.module';
import { ProfilsModule } from '../profils/profils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    SagasModule,
    CategoriesModule,
    NationalitiesModule,
    ProfilsModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
