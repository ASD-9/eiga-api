import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../roles/roles.service';
import { UserResponseDto } from './dto/user-reponse.dto';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from '../roles/dto/role-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const role: RoleResponseDto = await this.rolesService.findOneById(
        createUserDto.role_id,
      );

      const salt: string = await bcrypt.genSalt();
      const hashedPassword: string = await bcrypt.hash(
        createUserDto.password,
        salt,
      );

      const user: User = await this.usersRepository.save({
        ...createUserDto,
        password: hashedPassword,
        role: role,
      });

      return plainToInstance(UserResponseDto, user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      return plainToInstance(
        UserResponseDto,
        await this.usersRepository.find(),
      );
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findOneById(id: number): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Utilisateur ${id} introuvable`);
      }
      return plainToInstance(UserResponseDto, user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    try {
      const { password, role_id, ...rest } = updateUserDto;
      const updateData: Partial<User> = { ...rest };
      if (password) {
        const salt: string = await bcrypt.genSalt();
        const hashedPassword: string = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
      }
      if (role_id) {
        const role: RoleResponseDto =
          await this.rolesService.findOneById(role_id);
        updateData.role = role;
      }

      const result: UpdateResult = await this.usersRepository.update(
        id,
        updateData,
      );

      if (result.affected === 0) {
        throw new NotFoundException(`Utilisateur ${id} introuvable`);
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
      const result: DeleteResult = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Utilisateur ${id} introuvable`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }
}
