import { AuditService } from '../audit/audit.service';
import { BranchesRepository } from '../branches/repositories/branches.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TenantsRepository } from './repositories/tenants.repository';
import { TenantProvisioningService } from './tenant-provisioning.service';

describe('TenantProvisioningService', () => {
  const prisma = {
    $transaction: jest.fn(),
  } as any as PrismaService;

  const tenantsRepository = {
    createTenant: jest.fn(),
    findBySlug: jest.fn(),
  } as any as TenantsRepository;

  const branchesRepository = {
    createInitialBranch: jest.fn(),
  } as any as BranchesRepository;

  const auditService = {
    recordProvisioning: jest.fn(),
  } as any as AuditService;

  const service = new TenantProvisioningService(
    prisma,
    tenantsRepository,
    branchesRepository,
    auditService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('rejects invalid payloads before opening a transaction and records a failure audit', async () => {
    await expect(
      service.provision(
        {
          actorId: '',
          branchCode: '',
          branchName: '',
          branchSlug: '',
          currency: '',
          locale: '',
          tenantName: '',
          tenantSlug: '',
          timezone: '',
        },
        {
          requestId: 'req-invalid',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'validation-failed',
      }),
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(auditService.recordProvisioning).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          code: 'validation-failed',
        }),
        outcome: 'failure',
        requestId: 'req-invalid',
      }),
    );
  });

  it('rejects scoped provisioning requests and records a scope mismatch audit', async () => {
    await expect(
      service.provision(
        {
          actorId: 'system-admin',
          branchCode: 'Q1',
          branchName: 'Chi nhanh Quan 1',
          branchSlug: 'chi-nhanh-quan-1',
          currency: 'VND',
          locale: 'vi-VN',
          tenantName: 'Blue Coral Retail',
          tenantSlug: 'blue-coral-retail',
          timezone: 'Asia/Ho_Chi_Minh',
        },
        {
          requestId: 'req-scope',
          scopedTenantId: 'tenant-already-scoped',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'scope-mismatch',
      }),
    });

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(auditService.recordProvisioning).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          code: 'scope-mismatch',
        }),
        outcome: 'failure',
        requestId: 'req-scope',
      }),
    );
  });

  it('creates tenant and branch in one transaction and records a success audit', async () => {
    prisma.$transaction = jest.fn(async (callback: any) =>
      callback({
        branch: {
          create: jest.fn(),
        },
        branchConfiguration: {
          create: jest.fn(),
        },
        tenant: {
          create: jest.fn(),
          findUnique: jest.fn(),
        },
        tenantConfiguration: {
          create: jest.fn(),
        },
      }),
    ) as any;

    tenantsRepository.findBySlug = jest.fn().mockResolvedValue(null);
    tenantsRepository.createTenant = jest.fn().mockResolvedValue({
      id: 'tenant-001',
      name: 'Blue Coral Retail',
      slug: 'blue-coral-retail',
    });
    branchesRepository.createInitialBranch = jest.fn().mockResolvedValue({
      code: 'Q1',
      id: 'branch-001',
      name: 'Chi nhanh Quan 1',
      slug: 'chi-nhanh-quan-1',
    });

    await expect(
      service.provision(
        {
          actorId: 'system-admin',
          branchCode: 'Q1',
          branchName: 'Chi nhanh Quan 1',
          branchSlug: 'chi-nhanh-quan-1',
          currency: 'VND',
          locale: 'vi-VN',
          tenantName: 'Blue Coral Retail',
          tenantSlug: 'blue-coral-retail',
          timezone: 'Asia/Ho_Chi_Minh',
        },
        {
          requestId: 'req-success',
        },
      ),
    ).resolves.toEqual({
      branch: {
        code: 'Q1',
        name: 'Chi nhanh Quan 1',
        slug: 'chi-nhanh-quan-1',
      },
      branchId: 'branch-001',
      tenant: {
        name: 'Blue Coral Retail',
        slug: 'blue-coral-retail',
      },
      tenantId: 'tenant-001',
    });

    expect(auditService.recordProvisioning).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch-001',
        outcome: 'success',
        requestId: 'req-success',
        tenantId: 'tenant-001',
      }),
    );
  });

  it('records a failure audit before rethrowing unexpected transaction errors', async () => {
    const unexpectedError = new Error('database offline');

    prisma.$transaction = jest.fn().mockRejectedValue(unexpectedError) as any;

    await expect(
      service.provision(
        {
          actorId: 'system-admin',
          branchCode: 'Q1',
          branchName: 'Chi nhanh Quan 1',
          branchSlug: 'chi-nhanh-quan-1',
          currency: 'VND',
          locale: 'vi-VN',
          tenantName: 'Blue Coral Retail',
          tenantSlug: 'blue-coral-retail',
          timezone: 'Asia/Ho_Chi_Minh',
        },
        {
          requestId: 'req-unexpected',
        },
      ),
    ).rejects.toThrow(unexpectedError);

    expect(auditService.recordProvisioning).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'system-admin',
        details: expect.objectContaining({
          code: 'unexpected-error',
          message: 'database offline',
        }),
        outcome: 'failure',
        requestId: 'req-unexpected',
      }),
    );
  });
});
