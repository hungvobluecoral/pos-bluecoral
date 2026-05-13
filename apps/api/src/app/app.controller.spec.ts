import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return the onboarding foundation success envelope', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({
        data: {
          service: 'POS_BlueCoral API',
          docsPath: '/api/docs',
          foundation: 'ready-for-onboarding-expansion',
        },
        meta: {
          scope: 'system-admin',
        },
      });
    });
  });
});
