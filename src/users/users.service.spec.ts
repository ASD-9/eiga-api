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

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('fakeSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

const mockData = {
  id: 1,
  username: 'user1',
  password: 'hashedPassword',
  role: {
    id: 1,
    name: 'Super Admin',
    users: [],
  },
  role_id: 1,
  profils: [],
};

const mockData2 = {
  id: 2,
  username: 'user2',
  password: 'hashedPassword',
  role: {
    id: 2,
    name: 'Admin',
    users: [],
  },
  role_id: 2,
  profils: [],
};

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
      const createUserDto = {
        username: 'user1',
        password: 'password1',
        role_id: 1,
      };

      jest.spyOn(rolesService, 'findOneById').mockResolvedValue(mockData.role);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData);

      expect(await service.create(createUserDto)).toEqual(mockData);
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createUserDto = {
        username: 'user1',
        password: 'password1',
        role_id: 1,
      };

      jest.spyOn(rolesService, 'findOneById').mockResolvedValue(mockData.role);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(mockResult);
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAll()).rejects.toThrow(
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
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(rolesService, 'findOneById').mockResolvedValue(mockData.role);

      await service.update(id, updateUserDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, {
        role: {
          id: 1,
          name: 'Super Admin',
          users: [],
        },
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
