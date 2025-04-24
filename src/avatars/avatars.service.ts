import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { AvatarDto } from './dto/avatar.dto';

@Injectable()
export class AvatarsService {
  constructor(
    @InjectRepository(Avatar)
    private avatarsRepository: Repository<Avatar>,
  ) {}

  async create(createAvatarDto: AvatarDto, imageName: string): Promise<Avatar> {
    try {
      return await this.avatarsRepository.save({
        ...createAvatarDto,
        image_name: imageName,
      });
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<Avatar[]> {
    try {
      return await this.avatarsRepository.find();
    } catch {
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
      const result: DeleteResult = await this.avatarsRepository.delete(id);
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
}
