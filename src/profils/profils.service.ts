import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProfilDto } from './dto/create-profil.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Profil } from './entities/profil.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Avatar } from '../avatars/entities/avatar.entity';
import { AvatarsService } from '../avatars/avatars.service';
import { UsersService } from '../users/users.service';
import { ProfilResponseDto } from './dto/profil-response.dto';
import { plainToInstance } from 'class-transformer';
import { AvatarResponseDto } from '../avatars/dto/avatar-response.dto';
import { UserResponseDto } from '../users/dto/user-reponse.dto';

@Injectable()
export class ProfilsService {
  constructor(
    @InjectRepository(Profil)
    private profilsRepository: Repository<Profil>,
    private avatarsService: AvatarsService,
    private usersService: UsersService,
  ) {}

  async create(createProfilDto: CreateProfilDto): Promise<ProfilResponseDto> {
    try {
      const avatar: AvatarResponseDto = await this.avatarsService.findOneById(
        createProfilDto.avatar_id,
      );

      const user: UserResponseDto = await this.usersService.findOneById(
        createProfilDto.user_id,
      );

      const profil: Profil = await this.profilsRepository.save({
        ...createProfilDto,
        avatar,
        user,
      });

      return plainToInstance(ProfilResponseDto, profil);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAllByUser(userId: number): Promise<ProfilResponseDto[]> {
    try {
      return plainToInstance(
        ProfilResponseDto,
        await this.profilsRepository.find({
          where: { user: { id: userId } },
          relations: ['avatar'],
        }),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<ProfilResponseDto> {
    try {
      const profil = await this.profilsRepository.findOneBy({ id });
      if (!profil) {
        throw new NotFoundException(`Profil ${id} introuvable`);
      }
      return plainToInstance(ProfilResponseDto, profil);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateProfilDto: UpdateProfilDto): Promise<void> {
    try {
      const { avatar_id, ...rest } = updateProfilDto;
      const updateData: Partial<Profil> = { ...rest };
      if (avatar_id) {
        const avatar: AvatarResponseDto =
          await this.avatarsService.findOneById(avatar_id);
        updateData.avatar = avatar as Avatar;
      }

      const result: UpdateResult = await this.profilsRepository.update(
        id,
        updateData,
      );

      if (result.affected === 0) {
        throw new NotFoundException(`Profil ${id} introuvable`);
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
      const result: DeleteResult = await this.profilsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Profil ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
