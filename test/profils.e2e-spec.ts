import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ProfilsModule } from '../src/profils/profils.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profil } from '../src/profils/entities/profil.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Avatar } from '../src/avatars/entities/avatar.entity';
import { User } from '../src/users/entities/user.entity';
import { ValidationError } from 'class-validator';
import { App } from 'supertest/types';
import { Role } from '../src/roles/entities/role.entity';

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

const user = {
  id: 1,
  username: 'user1',
  password: 'hashedPassword',
  role: {
    id: 1,
    name: 'Super Admin',
  },
};

describe('Profils', () => {
  let app: INestApplication;
  let repository: Repository<Profil>;
  let avatarsRepository: Repository<Avatar>;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProfilsModule],
    })
      .overrideProvider(getRepositoryToken(Profil))
      .useValue({
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Avatar))
      .useValue({ findOneBy: jest.fn() })
      .overrideProvider(getRepositoryToken(User))
      .useValue({ findOneBy: jest.fn() })
      .overrideProvider(getRepositoryToken(Role))
      .useValue({})
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

    repository = moduleRef.get<Repository<Profil>>(getRepositoryToken(Profil));
    avatarsRepository = moduleRef.get<Repository<Avatar>>(
      getRepositoryToken(Avatar),
    );
    usersRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('/profils (POST', () => {
    it('should create a new profil and return it with status 201', async () => {
      jest
        .spyOn(avatarsRepository, 'findOneBy')
        .mockResolvedValue(mockData.avatar as Avatar);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user as User);
      jest.spyOn(repository, 'save').mockResolvedValue(mockData as Profil);

      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 1,
        user_id: 1,
      };

      return request(app.getHttpServer() as App)
        .post('/profils')
        .send(createProfilDto)
        .expect(201)
        .expect(mockData);
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const createProfilDto = { name: 2, avatar_id: 1, user_id: 1 };

      return request(app.getHttpServer() as App)
        .post('/profils')
        .send(createProfilDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom doit avoir au moins 3 caractères',
            'Le nom doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw BadRequestException if the avatar is not found', async () => {
      jest.spyOn(avatarsRepository, 'findOneBy').mockResolvedValue(null);

      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 99,
        user_id: 1,
      };

      return request(app.getHttpServer() as App)
        .post('/profils')
        .send(createProfilDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Avatar 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw NotFoundException if the user is not found', async () => {
      jest
        .spyOn(avatarsRepository, 'findOneBy')
        .mockResolvedValue(mockData.avatar as Avatar);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 1,
        user_id: 99,
      };

      return request(app.getHttpServer() as App)
        .post('/profils')
        .send(createProfilDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Utilisateur 99 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest
        .spyOn(avatarsRepository, 'findOneBy')
        .mockResolvedValue(mockData.avatar as Avatar);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user as User);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      const createProfilDto = {
        name: 'Profil1',
        avatar_id: 1,
        user_id: 1,
      };

      return request(app.getHttpServer() as App)
        .post('/profils')
        .send(createProfilDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/profils/user/:user-id (GET)', () => {
    it('should return all profils for the given user', async () => {
      const result = [mockData, mockData2];
      jest.spyOn(repository, 'find').mockResolvedValue(result as Profil[]);

      return request(app.getHttpServer() as App)
        .get('/profils/user/1')
        .expect(200)
        .expect(result);
    });

    it('should throw BadRequestException if the userId is not valid', async () => {
      return request(app.getHttpServer() as App)
        .get('/profils/user/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .get('/profils/user/1')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/profils/:id (PATCH)', () => {
    it('should update the profil and return status 204', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      const updateProfilDto = { name: 'Profil1' };

      return request(app.getHttpServer() as App)
        .patch('/profils/1')
        .send(updateProfilDto)
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .patch('/profils/abc')
        .send({})
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the data are not valid', async () => {
      const updateProfilDto = { name: 2 };

      return request(app.getHttpServer() as App)
        .patch('/profils/1')
        .send(updateProfilDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: [
            'Le nom doit avoir au moins 3 caractères',
            'Le nom doit être une chaîne de caractères',
          ],
        });
    });

    it('should throw BadRequestException if the avatar is not found', async () => {
      jest.spyOn(avatarsRepository, 'findOneBy').mockResolvedValue(null);

      const updateProfilDto = { avatar_id: 99 };

      return request(app.getHttpServer() as App)
        .patch('/profils/1')
        .send(updateProfilDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Avatar 99 introuvable',
          error: 'Not Found',
        });
    });

    it('should throw NotFoundException if the profil is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      const updateProfilDto = { name: 'Profil1' };

      return request(app.getHttpServer() as App)
        .patch('/profils/99')
        .send(updateProfilDto)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Profil 99 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error());

      const updateProfilDto = { name: 'Profil1' };

      return request(app.getHttpServer() as App)
        .patch('/profils/1')
        .send(updateProfilDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/profils/:id (DELETE)', () => {
    it('should delete the profil and return status 204', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/profils/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/profils/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the profil is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/profils/99')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Profil 99 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .delete('/profils/1')
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
