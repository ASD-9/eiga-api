import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NationalityDto } from './dto/nationality.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Nationality } from './entities/nationality.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class NationalitiesService {
  constructor(
    @InjectRepository(Nationality)
    private nationalitiesRepository: Repository<Nationality>,
  ) {}

  async create(createNationalityDto: NationalityDto): Promise<Nationality> {
    try {
      return await this.nationalitiesRepository.save(createNationalityDto);
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<Nationality[]> {
    try {
      return await this.nationalitiesRepository.find();
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(
    id: number,
    updateNationalityDto: NationalityDto,
  ): Promise<void> {
    try {
      const result: UpdateResult = await this.nationalitiesRepository.update(
        id,
        updateNationalityDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Nationalité ${id} introuvable`);
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
      const result: DeleteResult =
        await this.nationalitiesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Nationalité ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
