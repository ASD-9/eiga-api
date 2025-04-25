import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AvatarsModule } from '../src/avatars/avatars.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Avatar } from '../src/avatars/entities/avatar.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { App } from 'supertest/types';
import { ValidationError } from 'class-validator';
import { join } from 'path';
import * as fs from 'fs';

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

describe('Avatars', () => {
  let app: INestApplication;
  let repository: Repository<Avatar>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AvatarsModule],
    })
      .overrideProvider(getRepositoryToken(Avatar))
      .useValue({
        save: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })
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
    await app.init();

    repository = moduleRef.get<Repository<Avatar>>(getRepositoryToken(Avatar));
  });

  describe('/avatars (POST)', () => {
    afterEach(() => {
      const testPattern = new RegExp(
        `avatar-${Date.now().toString().substring(0, 9)}`,
      );

      fs.readdirSync(join(process.cwd(), 'public', 'avatars')).forEach(
        (file) => {
          if (testPattern.test(file)) {
            fs.unlinkSync(join(process.cwd(), 'public', 'avatars', file));
          }
        },
      );
    });

    it('should upload & create a new avatar and return it', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...mockData, profils: [] });

      const createAvatarDto = { name: 'avatar1' };

      return request(app.getHttpServer() as App)
        .post('/avatars')
        .attach('image', testFilePath)
        .field(createAvatarDto)
        .expect(201)
        .expect({ ...mockData, profils: [] })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw BadRequestException if the mime type is not supported', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.txt');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createAvatarDto = { name: 'avatar1' };

      return request(app.getHttpServer() as App)
        .post('/avatars')
        .attach('image', testFilePath)
        .field(createAvatarDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message:
            'Type de fichier non autorisé. Types acceptés: image/jpeg, image/png',
          error: 'Bad Request',
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw InternalServerErrorException if no file is uploaded', async () => {
      const createAvatarDto = { name: 'avatar1' };

      return request(app.getHttpServer() as App)
        .post('/avatars')
        .field(createAvatarDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });

    it('should throw BadRequestException if the name is not valid', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      const createAvatarDto = { name: '' };

      return request(app.getHttpServer() as App)
        .post('/avatars')
        .attach('image', testFilePath)
        .field(createAvatarDto)
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le nom ne doit pas être vide'],
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const testFilePath = join(process.cwd(), 'tmp', 'test.jpg');
      fs.writeFileSync(testFilePath, Buffer.alloc(1024));

      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      const createAvatarDto = { name: 'avatar1' };

      return request(app.getHttpServer() as App)
        .post('/avatars')
        .attach('image', testFilePath)
        .field(createAvatarDto)
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        })
        .then(() => {
          fs.unlinkSync(testFilePath);
        });
    });
  });

  describe('/avatars (GET)', () => {
    it('should return all avatars with status 200', () => {
      const result = [
        { ...mockData, profils: [] },
        { ...mockData2, profils: [] },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      return request(app.getHttpServer() as App)
        .get('/avatars')
        .expect(200)
        .expect(result);
    });

    it('should throw InternalServerErrorException with status 500', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .get('/avatars')
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/avatars/:id (PATCH)', () => {
    it('should return status 204 if the avatar is successfully updated', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);

      return request(app.getHttpServer() as App)
        .patch('/avatars/1')
        .send({ name: 'avatarEdit' })
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .patch('/avatars/abc')
        .send({ name: 'avatarEdit' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw BadRequestException if the name is not valid', async () => {
      return request(app.getHttpServer() as App)
        .patch('/avatars/1')
        .send({ name: 2 })
        .expect(400)
        .expect({
          message: 'Erreur de validation',
          details: ['Le nom doit être une chaîne de caractères'],
        });
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      return request(app.getHttpServer() as App)
        .patch('/avatars/1')
        .send({ name: 'avatarEdit' })
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Avatar 1 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .patch('/avatars/1')
        .send({ name: 'avatarEdit' })
        .expect(500)
        .expect({
          statusCode: 500,
          message: 'Erreur serveur, veuillez réessayer',
          error: 'Internal Server Error',
        });
    });
  });

  describe('/avatars/:id (DELETE)', () => {
    it('should return status 204 if the avatar is successfully deleted', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/avatars/1')
        .expect(204);
    });

    it('should throw BadRequestException if the id is not valid', async () => {
      return request(app.getHttpServer() as App)
        .delete('/avatars/abc')
        .expect(400)
        .expect({
          statusCode: 400,
          message: "L'id doit être un entier positif",
          error: 'Bad Request',
        });
    });

    it('should throw NotFoundException if the avatar is not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return request(app.getHttpServer() as App)
        .delete('/avatars/1')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Avatar 1 introuvable',
          error: 'Not Found',
        });
    });

    it("should throw InternalServerErrorException if there's an error", async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error());

      return request(app.getHttpServer() as App)
        .delete('/avatars/1')
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
