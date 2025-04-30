import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-reponse.dto';
import { RoleResponseDto } from '../roles/dto/role-response.dto';
import { MockFactory } from '../../test/mock-factory';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('fakeSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesService = module.get<RolesService>(RolesService);
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserDto = MockFactory.createMockCreateUserDto();
      const mockData = MockFactory.createMockUser();

      jest
        .spyOn(rolesService, 'findOneById')
        .mockResolvedValue(plainToInstance(RoleResponseDto, mockData.role));
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createUserDto)).toEqual(
        plainToInstance(UserResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the role is not found', async () => {
      const createUserDto = MockFactory.createMockCreateUserDto({
        role_id: 99,
      });

      jest
        .spyOn(rolesService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Rôle 99 introuvable'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        new NotFoundException('Rôle 99 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createUserDto = MockFactory.createMockCreateUserDto();
      const mockData = MockFactory.createMockUser();

      jest
        .spyOn(rolesService, 'findOneById')
        .mockResolvedValue(plainToInstance(RoleResponseDto, mockData.role));
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockResult = [
        MockFactory.createMockUser(),
        MockFactory.createMockUser({ id: 2 }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(
        plainToInstance(UserResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAll()).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findOneById', () => {
    it('should return the user with the given id', async () => {
      const mockData = MockFactory.createMockUser();
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockData);

      expect(await service.findOneById(id)).toEqual(
        plainToInstance(UserResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`Utilisateur ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error('Error'));

      await expect(service.findOneById(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('update', () => {
    it('should update the user with the given id', async () => {
      const id = 1;
      const updateUserDto = { username: 'editedUser' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateUserDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateUserDto);
    });

    it('should hash password and update the user with the given id', async () => {
      const id = 1;
      const updateUserDto = { password: 'newPassword' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateUserDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, {
        password: 'hashedPassword',
      });
    });

    it('should update the role of the user with the given id', async () => {
      const id = 1;
      const updateUserDto = { role_id: 1 };
      const mockRole = MockFactory.createMockRole();
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest
        .spyOn(rolesService, 'findOneById')
        .mockResolvedValue(plainToInstance(RoleResponseDto, mockRole));

      await service.update(id, updateUserDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, {
        role: mockRole,
      });
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const id = 99;
      const updateUserDto = { username: 'editedUser' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        new NotFoundException(`Utilisateur ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateUserDto = { username: 'editedUser' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the user with the given id', async () => {
      const id = 1;
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const id = 99;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Utilisateur ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      await expect(service.remove(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });
});
