import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { UsersModule } from '../src/users/users.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';
import { Role } from '../src/roles/entities/role.entity';

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
  },
};

describe('Users', () => {
  let app: INestApplication;
  let repository: Repository<User>;
  let rolesRepository: Repository<Role>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Role))
      .useValue({ findOneBy: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors: ValidationError[]) => {
          return new BadRequestException({
            message: 'Erreur de validation',
            details: errors.flatMap((error) =>
              Object.values(error.constraints ?? {}),
            ),
          });
        },
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get('Reflector')),
    );
    await app.init();

    repository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = moduleRef.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('/users (POST)', () => {
    it('should create a new user and return it with status 201', async () => {
      jest
        .spyOn(rolesRepository, 'findOneBy')
        .mockResolvedValue(mockData.role as Role);

      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...mockData, password: 'hashedPassword' } as User);

      const createUserDto = {
        username: 'user1',
        password: 'Password1!',
        role_id: 1,
      };

      return request(app.getHttpServer() as App)
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect(mockData);
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createUserDto = {
        username: 'user1',
        password: 'Password1!',
      };

      return request(app.getHttpServer() as App)
        .post('/users')
        .send(createUserDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le rôle doit être un entier positif',
            'Le rôle doit être un entier',
          ],
        });
    });

    it('should throw NotFoundException if the role is not found', async () => {
      jest.spyOn(rolesRepository, 'findOneBy').mockResolvedValue(null);

      const createUserDto = {
        username: 'user1',
        password: 'Password1!',
        role_id: 99,
      };

      return request(app.getHttpServer() as App)
        .post('/users')
        .send(createUserDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Rôle 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException with status 500', async () => {
      jest
        .spyOn(rolesRepository, 'findOneBy')
        .mockResolvedValue(mockData.role as Role);

      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      const createUserDto = {
        username: 'user1',
        password: 'Password1!',
        role_id: 1,
      };

      return request(app.getHttpServer() as App)
        .post('/users')
        .send(createUserDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/users (GET)', () => {
    it('should return all users with status 200', () => {
      const result = [
        { ...mockData, password: 'hashedPassword' },
        { ...mockData2, password: 'hashedPassword' },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result as User[]);

      return request(app.getHttpServer() as App)
        .get('/users')
        .expect(200)
        .expect([mockData, mockData2]);
    });

    it('should throw InternalServerErrorException with status 500', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .get('/users')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('shoudl return status 204 if the user is successfully updated', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      const updateUserDto = {
        username: 'user1',
      };

      return request(app.getHttpServer() as App)
        .patch('/users/1')
        .send(updateUserDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .patch('/users/abc')
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateUserDto = {
        username: 2,
      };

      return request(app.getHttpServer() as App)
        .patch('/users/1')
        .send(updateUserDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom doit avoir au moins 3 caractères',
            'Le nom doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw NotFoundException if the user is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      const updateUserDto = {
        username: 'user1',
      };

      return request(app.getHttpServer() as App)
        .patch('/users/99')
        .send(updateUserDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Utilisateur 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw NotFoundException if the role is not found', async () => {
      jest.spyOn(rolesRepository, 'findOneBy').mockResolvedValue(null);

      const updateUserDto = {
        username: 'user1',
        role_id: 99,
      };

      return request(app.getHttpServer() as App)
        .patch('/users/1')
        .send(updateUserDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Rôle 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw InternalServerErrorException with status 500', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error());

      const updateUserDto = {
        username: 'user1',
      };

      return request(app.getHttpServer() as App)
        .patch('/users/1')
        .send(updateUserDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should return status 204 if the user is successfully deleted', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/users/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/users/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the user is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/users/1')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Utilisateur 1 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .delete('/users/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
