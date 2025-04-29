import { Test, TestingModule } from '@nestjs/testing';
import { ProfilsService } from './profils.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Profil } from './entities/profil.entity';
import { AvatarsService } from '../avatars/avatars.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserResponseDto } from '../users/dto/user-reponse.dto';
import { plainToInstance } from 'class-transformer';
import { ProfilResponseDto } from './dto/profil-response.dto';
import { AvatarResponseDto } from '../avatars/dto/avatar-response.dto';

const mockData = {
  id: 1,
  name: 'Profil1',
  avatar: {
    id: 1,
    name: 'Avatar1',
    image_name: 'avatar1.jpg',
  },
  user: {
    id: 1,
    username: 'user1',
    password: 'hashedPassword',
    role: {
      id: 1,
      name: 'Super Admin',
    },
  },
};

const mockData2 = {
  id: 2,
  name: 'Profil2',
  avatar: {
    id: 2,
    name: 'Avatar2',
    image_name: 'avatar2.jpg',
    profils: [],
  },
  user: {
    id: 1,
    username: 'user1',
    password: 'hashedPassword',
    role: {
      id: 1,
      name: 'Super Admin',
    },
  },
};

describe('ProfilsService', () => {
  let service: ProfilsService;
  let repository: Repository<Profil>;
  let avatarsService: AvatarsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilsService,
        {
          provide: getRepositoryToken(Profil),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AvatarsService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfilsService>(ProfilsService);
    repository = module.get<Repository<Profil>>(getRepositoryToken(Profil));
    avatarsService = module.get<AvatarsService>(AvatarsService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new profil and return it', async () => {
      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 1,
        user_id: 1,
      };

      jest
        .spyOn(avatarsService, 'findOneById')
        .mockResolvedValue(mockData.avatar as AvatarResponseDto);
      jest
        .spyOn(usersService, 'findOneById')
        .mockResolvedValue(mockData.user as UserResponseDto);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData as Profil);

      expect(await service.create(createProfilDto)).toEqual(
        plainToInstance(ProfilResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 99,
        user_id: 1,
      };

      jest
        .spyOn(avatarsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Avatar 99 introuvable'));

      await expect(service.create(createProfilDto)).rejects.toThrow(
        new NotFoundException('Avatar 99 introuvable'),
      );
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 99,
        user_id: 1,
      };

      jest
        .spyOn(avatarsService, 'findOneById')
        .mockResolvedValue(mockData.avatar as AvatarResponseDto);
      jest
        .spyOn(usersService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Utilisateur 99 introuvable'));

      await expect(service.create(createProfilDto)).rejects.toThrow(
        new NotFoundException('Utilisateur 99 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 1,
        user_id: 1,
      };

      jest
        .spyOn(avatarsService, 'findOneById')
        .mockResolvedValue(mockData.avatar as AvatarResponseDto);
      jest
        .spyOn(usersService, 'findOneById')
        .mockResolvedValue(mockData.user as UserResponseDto);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createProfilDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return an array of profils for the given user', async () => {
      const userId = 1;
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult as Profil[]);

      expect(await service.findAllByUser(userId)).toEqual(
        plainToInstance(ProfilResponseDto, mockResult),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const userId = 1;
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Error'));

      await expect(service.findAllByUser(userId)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('update', () => {
    it('should update the profil with the given id', async () => {
      const id = 1;
      const updateProfilDto = { name: 'ProfilEdit' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateProfilDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateProfilDto);
    });

    it('should throw NotFoundException if the profil is not found', async () => {
      const id = 99;
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, {})).rejects.toThrow(
        new NotFoundException(`Profil ${id} introuvable`),
      );
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      const id = 1;
      const updateProfilDto = { avatar_id: 99 };
      jest
        .spyOn(avatarsService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Avatar 99 introuvable'));

      await expect(service.update(id, updateProfilDto)).rejects.toThrow(
        new NotFoundException('Avatar 99 introuvable'),
      );
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const id = 1;
      const updateProfilDto = { user_id: 99 };
      jest
        .spyOn(usersService, 'findOneById')
        .mockRejectedValue(new NotFoundException('Utilisateur 99 introuvable'));

      await expect(service.update(id, updateProfilDto)).rejects.toThrow(
        new NotFoundException('Utilisateur 99 introuvable'),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateProfilDto = { name: 'ProfilEdit' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateProfilDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the profil with the given id', async () => {
      const id = 1;
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if the profil is not found', async () => {
      const id = 99;
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Profil ${id} introuvable`),
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
