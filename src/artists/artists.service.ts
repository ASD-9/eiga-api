import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Repository, UpdateResult } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { Job } from '../jobs/entities/job.entity';
import { NationalitiesService } from '../nationalities/nationalities.service';
import { Nationality } from '../nationalities/entities/nationality.entity';
import { join } from 'path';
import * as fs from 'fs';

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
      const artist = await this.artistRepository.findOne({
        where: { id },
        select: ['image_name'],
      });
      if (!artist) {
        throw new NotFoundException(`Artiste ${id} introuvable`);
      }
      await this.artistRepository.delete(id);
      const artistPath = join(
        process.cwd(),
        'public',
        'artists',
        artist.image_name,
      );
      if (fs.existsSync(artistPath)) {
        try {
          fs.unlinkSync(artistPath);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
