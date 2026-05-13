import { Prisma, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { ProvisionTenantRequest } from '@pos-bluecoral/contracts';

@Injectable()
export class TenantsRepository {
  async findBySlug(prisma: Prisma.TransactionClient, tenantSlug: string) {
    return prisma.tenant.findUnique({
      where: {
        slug: tenantSlug,
      },
    });
  }

  async createTenant(
    prisma: Prisma.TransactionClient,
    payload: ProvisionTenantRequest,
  ) {
    const tenant = await prisma.tenant.create({
      data: {
        name: payload.tenantName,
        slug: payload.tenantSlug,
      },
    });

    await prisma.tenantConfiguration.create({
      data: {
        currency: payload.currency,
        locale: payload.locale,
        tenantId: tenant.id,
        timezone: payload.timezone,
      },
    });

    return tenant;
  }

  async listTenantsForOverview(prisma: PrismaClient) {
    return prisma.tenant.findMany({
      include: {
        branches: {
          where: { isDefault: true },
          include: { configuration: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
