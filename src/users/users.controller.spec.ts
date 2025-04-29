import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { UserResponseDto } from './dto/user-reponse.dto';

const mockData = {
  id: 1,
  username: 'user1',
  role: {
    id: 1,
    name: 'Super Admin',
  },
};

const mockData2 = {
  id: 2,
  username: 'user2',
  role: {
    id: 2,
    name: 'Admin',
    users: [],
  },
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: RolesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should return the created user', async () => {
      const createUserDto = {
        username: 'user1',
        password: 'password1',
        role_id: 1,
      };
      jest
        .spyOn(service, 'create')
        .mockImplementation(() => Promise.resolve(mockData as UserResponseDto));

      expect(await controller.create(createUserDto)).toEqual(mockData);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() =>
          Promise.resolve(mockResult as UserResponseDto[]),
        );

      expect(await controller.findAll()).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should return status 204 if the user is successfully updated', async () => {
      const id = 1;
      const updateUserDto = { username: 'editedUser' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateUserDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the user is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
