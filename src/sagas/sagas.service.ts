import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SagaDto } from './dto/saga.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Saga } from './entities/saga.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SagaResponseDto } from './dto/saga-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SagasService {
  constructor(
    @InjectRepository(Saga)
    private sagasRepository: Repository<Saga>,
  ) {}

  async create(createSagasDto: SagaDto): Promise<SagaResponseDto> {
    try {
      return plainToInstance(
        SagaResponseDto,
        await this.sagasRepository.save(createSagasDto),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<SagaResponseDto[]> {
    try {
      return plainToInstance(
        SagaResponseDto,
        await this.sagasRepository.find(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<SagaResponseDto> {
    try {
      const saga = await this.sagasRepository.findOneBy({ id });
      if (!saga) {
        throw new NotFoundException(`Saga ${id} introuvable`);
      }
      return plainToInstance(SagaResponseDto, saga);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateSagasDto: SagaDto): Promise<void> {
    try {
      const result: UpdateResult = await this.sagasRepository.update(
        id,
        updateSagasDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Saga ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result: DeleteResult = await this.sagasRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Saga ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
