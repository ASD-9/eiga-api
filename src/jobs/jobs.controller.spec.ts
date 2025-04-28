import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { plainToInstance } from 'class-transformer';
import { JobResponseDto } from './dto/job-response.dto';

const mockData = plainToInstance(JobResponseDto, {
  id: 1,
  name: 'Job 1',
});

const mockData2 = plainToInstance(JobResponseDto, {
  id: 2,
  name: 'Job 2',
});

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get<JobsService>(JobsService);
  });

  describe('create', () => {
    it('should return the created job', async () => {
      const createJobDto = { name: 'Job 1' };
      jest.spyOn(service, 'create').mockResolvedValue(mockData);

      expect(await controller.create(createJobDto)).toEqual(mockData);
    });
  });

  describe('findAll', () => {
    it('should return an array of jobs', async () => {
      const mockResult = [mockData, mockData2];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(mockResult));

      expect(await controller.findAll()).toBe(mockResult);
    });
  });

  describe('update', () => {
    it('should return status 204 if the job is successfully updated', async () => {
      const id = 1;
      const updateJobDto = { name: 'Job 1' };
      jest.spyOn(service, 'update').mockImplementation(() => Promise.resolve());

      expect(await controller.update(id, updateJobDto)).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return status 204 if the job is successfully deleted', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockImplementation(() => Promise.resolve());

      expect(await controller.remove(id)).toBeUndefined();
    });
  });
});
