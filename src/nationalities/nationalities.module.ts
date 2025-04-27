import { Module } from '@nestjs/common';
import { NationalitiesService } from './nationalities.service';
import { NationalitiesController } from './nationalities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nationality } from './entities/nationality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nationality])],
  controllers: [NationalitiesController],
  providers: [NationalitiesService],
  exports: [NationalitiesService],
})
export class NationalitiesModule {}
