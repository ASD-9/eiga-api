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
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const role: Role = await this.rolesService.findOneById(
        createUserDto.role_id,
      );

      const salt: string = await bcrypt.genSalt();
      const hashedPassword: string = await bcrypt.hash(
        createUserDto.password,
        salt,
      );

      return await this.usersRepository.save({
        ...createUserDto,
        password: hashedPassword,
        role: role,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find();
    } catch {
      throw new InternalServerErrorException(
        'Erreur serveur, veuillez réessayer',
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    try {
      const { role_id, ...updateData }: Partial<User> = { ...updateUserDto };
      if (updateUserDto.password) {
        const salt: string = await bcrypt.genSalt();
        const hashedPassword: string = await bcrypt.hash(
          updateUserDto.password,
          salt,
        );
        updateData.password = hashedPassword;
      }
      if (role_id) {
        const role: Role = await this.rolesService.findOneById(role_id);
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
