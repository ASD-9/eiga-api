import { Test, TestingModule } from '@nestjs/testing';
import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';
import { InternalServerErrorException } from '@nestjs/common';

const mockData = {
  id: 1,
  name: 'avatar1',
  image_name: 'avatar1.jpg',
  profils: [],
};

const mockData2 = {
  id: 2,
  name: 'avatar2',
  image_name: 'avatar2.jpg',
  profils: [],
};

describe('AvatarsController', () => {
  let controller: AvatarsController;
  let service: AvatarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarsController],
      providers: [
        AvatarsService,
        {
          provide: getRepositoryToken(Avatar),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AvatarsController>(AvatarsController);
    service = module.get<AvatarsService>(AvatarsService);
  });

  describe('create', () => {
    it('should return status 201 with the created avatar', async () => {
      const createAvatarDto = { name: 'avatar1' };
      const file = { filename: 'avatar1.jpg' };
      jest
        .spyOn(service, 'create')
        .mockImplementation(() => Promise.resolve(mockData));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(await controller.create(createAvatarDto, file as any)).toBe(
        mockData,
      );
    });

    it('should throw InternalServerErrorException if no file is uploaded', async () => {
      const createAvatarDto = { name: 'avatar1' };
      const file = null;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await controller.create(createAvatarDto, file as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.message).toBe('Erreur serveur, veuillez réessayer');
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of avatars', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.findAll()).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should return status 204 if the avatar is successfully updated', async () => {
      const id = 1;
      const updateAvatarDto = { name: 'avatarEdit' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateAvatarDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the avatar is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
