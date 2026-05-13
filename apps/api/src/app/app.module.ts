import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { AuditModule } from '../modules/audit/audit.module';
import { AuthModule } from '../modules/auth/auth.module';
import { BranchesModule } from '../modules/branches/branches.module';
import { RegistrationsModule } from '../modules/registrations/registrations.module';
import { TenantsModule } from '../modules/tenants/tenants.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, BranchesModule, TenantsModule, RegistrationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
