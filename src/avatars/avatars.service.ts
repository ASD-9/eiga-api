import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';
import { Repository, UpdateResult } from 'typeorm';
import { AvatarDto } from './dto/avatar.dto';
import * as fs from 'fs';
import { join } from 'path';
import { AvatarResponseDto } from './dto/avatar-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AvatarsService {
  constructor(
    @InjectRepository(Avatar)
    private avatarsRepository: Repository<Avatar>,
  ) {}

  async create(
    createAvatarDto: AvatarDto,
    imageName: string,
  ): Promise<AvatarResponseDto> {
    try {
      return plainToInstance(
        AvatarResponseDto,
        await this.avatarsRepository.save({
          ...createAvatarDto,
          image_name: imageName,
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<AvatarResponseDto[]> {
    try {
      return plainToInstance(
        AvatarResponseDto,
        await this.avatarsRepository.find(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<AvatarResponseDto> {
    try {
      const avatar = await this.avatarsRepository.findOneBy({ id });
      if (!avatar) {
        throw new NotFoundException(`Avatar ${id} introuvable`);
      }
      return plainToInstance(AvatarResponseDto, avatar);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateAvatarDto: AvatarDto): Promise<void> {
    try {
      const result: UpdateResult = await this.avatarsRepository.update(
        id,
        updateAvatarDto,
      );
      if (result.affected === 0) {
        throw new NotFoundException(`Avatar ${id} introuvable`);
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
      const avatar = await this.avatarsRepository.findOne({
        where: { id },
        select: ['image_name'],
      });
      if (!avatar) {
        throw new NotFoundException(`Avatar ${id} introuvable`);
      }
      await this.avatarsRepository.delete(id);
      const avatarPath = join(
        process.cwd(),
        'public',
        'avatars',
        avatar.image_name,
      );
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
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
