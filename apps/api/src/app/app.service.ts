import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): {
    service: string;
    docsPath: string;
    foundation: string;
  } {
    return {
      service: 'POS_BlueCoral API',
      docsPath: '/api/docs',
      foundation: 'ready-for-onboarding-expansion',
    };
  }
}
