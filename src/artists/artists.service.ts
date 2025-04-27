import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { Job } from '../jobs/entities/job.entity';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { Nationality } from '../nationalities/entities/nationality.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    private jobsService: JobsService,
    private nationalitiesService: NationalitiesService,
  ) {}

  async create(
    createArtistDto: CreateArtistDto,
    imageName: string,
  ): Promise<Artist> {
    try {
      const jobs: Job[] = [];
      for (const jobId of createArtistDto.jobs_ids) {
        jobs.push(await this.jobsService.findOneById(jobId));
      }

      const nationalities: Nationality[] = [];
      for (const nationalityId of createArtistDto.nationalities_ids) {
        nationalities.push(
          await this.nationalitiesService.findOneById(nationalityId),
        );
      }

      return await this.artistRepository.save({
        ...createArtistDto,
        jobs,
        nationalities,
        image_name: imageName,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<Artist[]> {
    try {
      return await this.artistRepository.find();
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateArtistDto: UpdateArtistDto): Promise<void> {
    try {
      const result: UpdateResult = await this.artistRepository.update(
        id,
        updateArtistDto,
      );

      if (result.affected === 0) {
        throw new NotFoundException(`Artiste ${id} introuvable`);
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
      const result: DeleteResult = await this.artistRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Artiste ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
