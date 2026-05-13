import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { ProvisionTenantRequest } from '@pos-bluecoral/contracts';

@Injectable()
export class BranchesRepository {
  async createInitialBranch(
    prisma: Prisma.TransactionClient,
    tenantId: string,
    payload: ProvisionTenantRequest,
  ) {
    const branch = await prisma.branch.create({
      data: {
        code: payload.branchCode,
        isDefault: true,
        name: payload.branchName,
        slug: payload.branchSlug,
        tenantId,
      },
    });

    await prisma.branchConfiguration.create({
      data: {
        branchId: branch.id,
      },
    });

    return branch;
  }
}
