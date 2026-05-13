import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RegistrationRepository } from './repositories/registration.repository';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationRepository],
})
export class RegistrationsModule {}
