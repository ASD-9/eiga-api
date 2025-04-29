import { Test, TestingModule } from '@nestjs/testing';
import { ProfilsController } from './profils.controller';
import { ProfilsService } from './profils.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profil } from './entities/profil.entity';
import { AvatarsService } from '../avatars/avatars.service';
import { UsersService } from '../users/users.service';
import { ProfilResponseDto } from './dto/profil-response.dto';

const mockData = {
  id: 1,
  name: 'Profil1',
  avatar: {
    id: 1,
    name: 'Avatar1',
    image_name: 'avatar1.jpg',
  },
};

const mockData2 = {
  id: 2,
  name: 'Profil2',
  avatar: {
    id: 2,
    name: 'Avatar2',
    image_name: 'avatar2.jpg',
  },
};

describe('ProfilsController', () => {
  let controller: ProfilsController;
  let service: ProfilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilsController],
      providers: [
        ProfilsService,
        {
          provide: getRepositoryToken(Profil),
          useValue: {},
        },
        {
          provide: AvatarsService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProfilsController>(ProfilsController);
    service = module.get<ProfilsService>(ProfilsService);
  });

  describe('create', () => {
    it('should return the created user', async () => {
      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 1,
        user_id: 1,
      };
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockData as ProfilResponseDto);

      expect(await controller.create(createProfilDto)).toEqual(mockData);
    });
  });

  describe('findAllByUser', () => {
    it('should return an array of profils for the given user', async () => {
      const userId = 1;
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAllByUser')
        .mockResolvedValue(mockResult as ProfilResponseDto[]);

      expect(await controller.findAllByUser(userId)).toEqual([
        mockData,
        mockData2,
      ]);
    });
  });

  describe('update', () => {
    it('should return status 204 if the profil is successfully updated', async () => {
      const id = 1;
      const updateProfilDto = { name: 'editedProfil' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateProfilDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the profil is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
