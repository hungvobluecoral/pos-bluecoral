import { Injectable } from '@nestjs/common';
import {
  TENANT_READINESS_STATUSES,
  type TenantOverviewResult,
  type TenantReadinessStatus,
} from '@pos-bluecoral/contracts';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TenantsRepository } from './repositories/tenants.repository';

@Injectable()
export class TenantOverviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsRepository: TenantsRepository,
  ) {}

  private normalizeReadinessStatus(status: string | null | undefined): TenantReadinessStatus {
    if (
      status !== undefined &&
      status !== null &&
      TENANT_READINESS_STATUSES.includes(status as TenantReadinessStatus)
    ) {
      return status as TenantReadinessStatus;
    }

    return 'blocked';
  }

  async getOverview(): Promise<TenantOverviewResult> {
    const tenants = await this.tenantsRepository.listTenantsForOverview(
      this.prisma,
    );

    const items = tenants.map((tenant) => {
      const defaultBranch = tenant.branches[0] ?? null;

      return {
        tenantId: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        createdAt: tenant.createdAt.toISOString(),
        defaultBranch: defaultBranch
          ? {
              branchId: defaultBranch.id,
              name: defaultBranch.name,
              slug: defaultBranch.slug,
              code: defaultBranch.code,
              readinessStatus: this.normalizeReadinessStatus(
                defaultBranch.configuration?.readinessStatus,
              ),
            }
          : null,
      };
    });

    return {
      totalTenants: items.length,
      items,
    };
  }
}
