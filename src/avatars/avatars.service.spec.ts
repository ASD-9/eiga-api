import { Test, TestingModule } from '@nestjs/testing';
import { AvatarsService } from './avatars.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Avatar } from './entities/avatar.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { plainToInstance } from 'class-transformer';
import { AvatarResponseDto } from './dto/avatar-response.dto';

const mockData = {
  id: 1,
  name: 'avatar1',
  image_name: 'avatar1.jpg',
};

const mockData2 = {
  id: 2,
  name: 'avatar2',
  image_name: 'avatar2.jpg',
};

describe('AvatarsService', () => {
  let service: AvatarsService;
  let repository: Repository<Avatar>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        {
          provide: getRepositoryToken(Avatar),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AvatarsService>(AvatarsService);
    repository = module.get<Repository<Avatar>>(getRepositoryToken(Avatar));
  });

  describe('create', () => {
    it('should create a new avatar and return it', async () => {
      const createAvatarDto = { name: 'avatar1' };
      const imageName = 'avatar1.jpg';
      jest.spyOn(repository, 'save').mockResolvedValue(mockData as Avatar);

      expect(await service.create(createAvatarDto, imageName)).toEqual(
        plainToInstance(AvatarResponseDto, mockData),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const createAvatarDto = { name: 'avatar1' };
      const imageName = 'avatar1.jpg';
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create(createAvatarDto, imageName)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of avatars', async () => {
      const mockResult = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult as Avatar[]);

      expect(await service.findAll()).toEqual(
        plainToInstance(AvatarResponseDto, mockResult),
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
    it('should return the avatar with the given id', async () => {
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockData as Avatar);

      expect(await service.findOneById(id)).toEqual(
        plainToInstance(AvatarResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`Avatar ${id} introuvable`),
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
    it('should update the avatar with the given id', async () => {
      const id = 1;
      const updateAvatarDto = { name: 'avatarEdit' };
      const mockUpdate = jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      await service.update(id, updateAvatarDto);

      expect(mockUpdate).toHaveBeenCalledWith(id, updateAvatarDto);
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      const id = 99;
      const updateAvatarDto = { name: 'avatarEdit' };
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      await expect(service.update(id, updateAvatarDto)).rejects.toThrow(
        new NotFoundException(`Avatar ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      const updateAvatarDto = { name: 'avatarEdit' };
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(id, updateAvatarDto)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });

  describe('remove', () => {
    it('should remove the avatar with the given id and delete his image', async () => {
      const testFilePath = join(
        process.cwd(),
        'public',
        'avatars',
        'avatar1.jpg',
      );
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const id = 1;
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ image_name: 'avatar1.jpg' } as Avatar);
      const mockDelete = jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(id);

      expect(mockDelete).toHaveBeenCalledWith(id);
      expect(fs.existsSync(testFilePath)).toBe(false);
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Avatar ${id} introuvable`),
      );
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      const id = 1;
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ image_name: 'avatar1.jpg' } as Avatar);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      await expect(service.remove(id)).rejects.toThrow(
        new InternalServerErrorException('Erreur serveur, veuillez réessayer'),
      );
    });
  });
});
