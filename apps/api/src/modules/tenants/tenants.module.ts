import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { TenantOverviewService } from './tenant-overview.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './repositories/tenants.repository';

@Module({
  controllers: [TenantsController],
  imports: [AuditModule, BranchesModule],
  providers: [TenantProvisioningService, TenantOverviewService, TenantsRepository],
})
export class TenantsModule {}
