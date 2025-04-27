import { Module } from '@nestjs/common';
import { SagasService } from './sagas.service';
import { SagasController } from './sagas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saga } from './entities/saga.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Saga])],
  controllers: [SagasController],
  providers: [SagasService],
  exports: [SagasService],
})
export class SagasModule {}
