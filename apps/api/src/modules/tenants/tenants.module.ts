import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './repositories/tenants.repository';

@Module({
  controllers: [TenantsController],
  imports: [AuditModule, BranchesModule],
  providers: [TenantProvisioningService, TenantsRepository],
})
export class TenantsModule {}
