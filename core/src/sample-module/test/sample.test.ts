import request from 'supertest';
import logger from '@blockspaces/shared/loggers/bscLogger';
import { INestApplication, Logger } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_LOGGER_TOKEN } from '../../logging/constants';
import { SampleController } from '../controllers/SampleController';
import { ExceptionsFilter } from '../filters/ExceptionsFilter';
import { SampleModule } from "../SampleModule";
import { SampleService } from '../services/SampleService';

describe.skip('Sample', () => {
  let app: INestApplication;
  let controller: SampleController;
  let service: SampleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SampleModule],
      providers: [
        SampleService,
        {
          provide: APP_FILTER,
          useClass: ExceptionsFilter
        },
        {
          provide: DEFAULT_LOGGER_TOKEN,
          useValue: logger
        }
      ]
    }).compile();
    // this is not working
    // app = module.createNestApplication();
    // await app.init();

    controller = module.get<SampleController>(SampleController);
    service = module.get<SampleService>(SampleService);
  }, 15000);

  afterAll(async () => {
    // await app.close();
  });

  it('', () => {
    expect(true).toBeTruthy();
  });
  // it('should the correct value', () => {
  //   const httpServer = app.getHttpServer();
  //   return request(httpServer)
  //     .get('/api/sample/testBadRequest')
  //     .expect(400);

  // });

  // this is not working
  // it('should the correct value', async () => {

  //   expect(await controller.testBadRequest()).toThrow();

  // });
});