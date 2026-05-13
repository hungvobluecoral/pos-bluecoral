import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TenantsRepository } from './repositories/tenants.repository';
import { TenantOverviewService } from './tenant-overview.service';

describe('TenantOverviewService', () => {
  const tenantsRepository = {
    listTenantsForOverview: jest.fn(),
  } as any as TenantsRepository;

  const prisma = {} as any as PrismaService;

  const service = new TenantOverviewService(prisma, tenantsRepository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns zero count and empty items array when no tenants exist', async () => {
    jest.mocked(tenantsRepository.listTenantsForOverview).mockResolvedValue([]);

    const result = await service.getOverview();

    expect(result).toEqual({ totalTenants: 0, items: [] });
  });

  it('returns correct tenant count and maps items from repository data', async () => {
    const mockTenants = [
      {
        id: 'tenant-1',
        name: 'Blue Coral',
        slug: 'blue-coral',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        branches: [
          {
            id: 'branch-1',
            name: 'Chi nhanh Q1',
            slug: 'chi-nhanh-q1',
            code: 'Q1',
            isDefault: true,
            configuration: { readinessStatus: 'active' },
          },
        ],
      },
    ];

    jest
      .mocked(tenantsRepository.listTenantsForOverview)
      .mockResolvedValue(mockTenants as any);

    const result = await service.getOverview();

    expect(result.totalTenants).toBe(1);
    expect(result.items[0]).toEqual({
      tenantId: 'tenant-1',
      name: 'Blue Coral',
      slug: 'blue-coral',
      createdAt: '2024-01-01T00:00:00.000Z',
      defaultBranch: {
        branchId: 'branch-1',
        name: 'Chi nhanh Q1',
        slug: 'chi-nhanh-q1',
        code: 'Q1',
        readinessStatus: 'active',
      },
    });
  });

  it('maps null defaultBranch when tenant has no branches', async () => {
    const mockTenants = [
      {
        id: 'tenant-2',
        name: 'Empty Tenant',
        slug: 'empty-tenant',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
        branches: [],
      },
    ];

    jest
      .mocked(tenantsRepository.listTenantsForOverview)
      .mockResolvedValue(mockTenants as any);

    const result = await service.getOverview();

    expect(result.items[0].defaultBranch).toBeNull();
  });

  it('defaults readinessStatus to "blocked" when branch configuration is absent', async () => {
    const mockTenants = [
      {
        id: 'tenant-3',
        name: 'No Config Tenant',
        slug: 'no-config-tenant',
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
        branches: [
          {
            id: 'branch-3',
            name: 'Main Branch',
            slug: 'main-branch',
            code: 'MAIN',
            isDefault: true,
            configuration: null,
          },
        ],
      },
    ];

    jest
      .mocked(tenantsRepository.listTenantsForOverview)
      .mockResolvedValue(mockTenants as any);

    const result = await service.getOverview();

    expect(result.items[0].defaultBranch?.readinessStatus).toBe('blocked');
  });

  it('coerces unsupported readinessStatus values back to "blocked"', async () => {
    const mockTenants = [
      {
        id: 'tenant-4',
        name: 'Unexpected Status Tenant',
        slug: 'unexpected-status-tenant',
        createdAt: new Date('2024-04-01T00:00:00.000Z'),
        branches: [
          {
            id: 'branch-4',
            name: 'Fallback Branch',
            slug: 'fallback-branch',
            code: 'FB',
            isDefault: true,
            configuration: { readinessStatus: 'offline' },
          },
        ],
      },
    ];

    jest
      .mocked(tenantsRepository.listTenantsForOverview)
      .mockResolvedValue(mockTenants as any);

    const result = await service.getOverview();

    expect(result.items[0].defaultBranch?.readinessStatus).toBe('blocked');
  });

  it('returns items ordered as provided by repository (newest first)', async () => {
    const mockTenants = [
      {
        id: 'tenant-a',
        name: 'Tenant A',
        slug: 'tenant-a',
        createdAt: new Date('2024-12-01T00:00:00.000Z'),
        branches: [],
      },
      {
        id: 'tenant-b',
        name: 'Tenant B',
        slug: 'tenant-b',
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
        branches: [],
      },
    ];

    jest
      .mocked(tenantsRepository.listTenantsForOverview)
      .mockResolvedValue(mockTenants as any);

    const result = await service.getOverview();

    expect(result.totalTenants).toBe(2);
    expect(result.items[0].tenantId).toBe('tenant-a');
    expect(result.items[1].tenantId).toBe('tenant-b');
  });
});
