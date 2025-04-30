import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { MockFactory } from '../../test/mock-factory';
import { RoleResponseDto } from './dto/role-response.dto';
import { plainToInstance } from 'class-transformer';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const mockResult = plainToInstance(RoleResponseDto, [
        MockFactory.createMockRole({ id: 1 }),
        MockFactory.createMockRole({ id: 2 }),
      ]);
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.findAll()).toBe(mockResult);
    });
  });
});
