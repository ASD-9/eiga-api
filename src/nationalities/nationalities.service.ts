import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NationalityDto } from './dto/nationality.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Nationality } from './entities/nationality.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { NationalityResponseDto } from './dto/nationality-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NationalitiesService {
  constructor(
    @InjectRepository(Nationality)
    private nationalitiesRepository: Repository<Nationality>,
  ) {}

  async create(
    createNationalityDto: NationalityDto,
  ): Promise<NationalityResponseDto> {
    try {
      return plainToInstance(
        NationalityResponseDto,
        await this.nationalitiesRepository.save(createNationalityDto),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<NationalityResponseDto[]> {
    try {
      return plainToInstance(
        NationalityResponseDto,
        await this.nationalitiesRepository.find(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<NationalityResponseDto> {
    try {
      const nationality = await this.nationalitiesRepository.findOneBy({ id });
      if (!nationality) {
        throw new NotFoundException(`Nationalité ${id} introuvable`);
      }
      return plainToInstance(NationalityResponseDto, nationality);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
