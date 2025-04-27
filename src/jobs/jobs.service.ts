import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JobDto } from './dto/job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: JobDto): Promise<Job> {
    try {
      return await this.jobsRepository.save(createJobDto);
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<Job[]> {
    try {
      return await this.jobsRepository.find();
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<Job> {
    try {
      const job = await this.jobsRepository.findOneBy({ id });
      if (!job) {
        throw new NotFoundException(`Métier ${id} introuvable`);
      }
      return job;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateJobDto: JobDto): Promise<void> {
    try {
      const result: UpdateResult = await this.jobsRepository.update(
        id,
        updateJobDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Métier ${id} introuvable`);
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
      const result: DeleteResult = await this.jobsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Métier ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
