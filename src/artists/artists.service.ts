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
import { NationalitiesService } from '../nationalities/nationalities.service';
import { join } from 'path';
import * as fs from 'fs';
import { ArtistLightResponseDto } from './dto/artist-light-response.dto';
import { plainToInstance } from 'class-transformer';
import { ArtistResponseDto } from './dto/artist-response';
import { JobResponseDto } from '../jobs/dto/job-response.dto';
import { NationalityResponseDto } from '../nationalities/dto/nationality-response.dto';

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
  ): Promise<ArtistLightResponseDto> {
    try {
      const jobs: JobResponseDto[] = [];
      for (const jobId of createArtistDto.jobs_ids) {
        jobs.push(await this.jobsService.findOneById(jobId));
      }

      const nationalities: NationalityResponseDto[] = [];
      for (const nationalityId of createArtistDto.nationalities_ids) {
        nationalities.push(
          await this.nationalitiesService.findOneById(nationalityId),
        );
      }

      const artist: Artist = await this.artistRepository.save({
        ...createArtistDto,
        jobs,
        nationalities,
        image_name: imageName,
      });

      return plainToInstance(ArtistLightResponseDto, artist);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<ArtistLightResponseDto[]> {
    try {
      return plainToInstance(
        ArtistLightResponseDto,
        await this.artistRepository.find({
          select: ['id', 'name', 'image_name'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<ArtistResponseDto> {
    try {
      const artist: Artist | null = await this.artistRepository.findOne({
        where: { id },
        relations: ['jobs', 'nationalities'],
      });
      if (!artist) {
        throw new NotFoundException(`Artiste ${id} introuvable`);
      }
      return plainToInstance(ArtistResponseDto, artist);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
