import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RoleResponseDto } from './dto/role-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<RoleResponseDto[]> {
    try {
      return plainToInstance(
        RoleResponseDto,
        await this.rolesRepository.find(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<RoleResponseDto> {
    try {
      const role = await this.rolesRepository.findOneBy({ id });
      if (!role) {
        throw new NotFoundException(`Rôle ${id} introuvable`);
      }
      return plainToInstance(RoleResponseDto, role);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
