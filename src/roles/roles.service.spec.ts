import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MockFactory } from '../../test/mock-factory';
import { RoleResponseDto } from './dto/role-response.dto';

describe('RolesService', () => {
  let service: RolesService;
  let repository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const mockResult = [
        MockFactory.createMockRole({ id: 1 }),
        MockFactory.createMockRole({ id: 2 }),
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockResult);

      expect(await service.findAll()).toEqual(
        plainToInstance(RoleResponseDto, mockResult),
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
    it('should return the role with the given id', async () => {
      const id = 1;
      const mockData = MockFactory.createMockRole({ id });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockData);

      expect(await service.findOneById(id)).toEqual(
        plainToInstance(RoleResponseDto, mockData),
      );
    });

    it('should throw NotFoundException if the role is not found', async () => {
      const id = 99;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneById(id)).rejects.toThrow(
        new NotFoundException(`Rôle ${id} introuvable`),
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
});
