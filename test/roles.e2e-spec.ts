import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RolesModule } from '../src/roles/roles.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../src/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { App } from 'supertest/types';

const mockData = {
  id: 1,
  name: 'Super Admin',
};

const mockData2 = {
  id: 2,
  name: 'Admin',
};

describe('Roles', () => {
  let app: INestApplication;
  let repository: Repository<Role>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RolesModule],
    })
      .overrideProvider(getRepositoryToken(Role))
      .useValue({ find: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    repository = moduleRef.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('/roles (GET) should return all roles with status 200', () => {
    const result = [
      { ...mockData, users: [] },
      { ...mockData2, users: [] },
    ];
    jest.spyOn(repository, 'find').mockResolvedValue(result);

    return request(app.getHttpServer() as App)
      .get('/roles')
      .expect(200)
      .expect(result);
  });

  it('/roles (GET) should throw InternalServerErrorException with status 500', async () => {
    jest.spyOn(repository, 'find').mockRejectedValue(new Error());

    const response: request.Response = await request(
      app.getHttpServer() as App,
    ).get('/roles');

    const body = response.body as {
      statusCode: number;
      message: string;
    };

    expect(response.status).toBe(500);
    expect(body.message).toBe('Erreur serveur, veuillez réessayer');
    expect(body.statusCode).toBe(500);
  });

  afterAll(async () => {
    await app.close();
  });
});
