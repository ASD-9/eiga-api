import { Test, TestingModule } from '@nestjs/testing';
import { ProfilsController } from './profils.controller';
import { ProfilsService } from './profils.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profil } from './entities/profil.entity';
import { AvatarsService } from '../avatars/avatars.service';
import { UsersService } from '../users/users.service';
import { ProfilResponseDto } from './dto/profil-response.dto';
import { MockFactory } from '../../test/mock-factory';
import { plainToInstance } from 'class-transformer';

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
      const createProfilDto = MockFactory.createMockCreateProfilDto();
      const mockData = plainToInstance(
        ProfilResponseDto,
        MockFactory.createMockProfil(),
      );
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      expect(await controller.create(createProfilDto)).toEqual(mockData);
    });
  });

  describe('findAllByUser', () => {
    it('should return an array of profils for the given user', async () => {
      const mockResult = plainToInstance(ProfilResponseDto, [
        MockFactory.createMockProfil(),
        MockFactory.createMockProfil({ id: 2 }),
      ]);
      jest.spyOn(service, 'findAllByUser').mockResolvedValue(mockResult);

      expect(await controller.findAllByUser(1)).toEqual(mockResult);
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
