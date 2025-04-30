import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { JobsModule } from '../jobs/jobs.module';
import { NationalitiesModule } from '../nationalities/nationalities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist]),
    JobsModule,
    NationalitiesModule,
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
