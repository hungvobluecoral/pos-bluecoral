import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from './page';

jest.mock('../../../lib/server/api');

const mockFetchTenantOverview = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  const serverApi = jest.requireMock('../../../lib/server/api') as {
    fetchTenantOverview: typeof mockFetchTenantOverview;
  };
  serverApi.fetchTenantOverview = mockFetchTenantOverview;
});

describe('Admin dashboard page', () => {
  it('renders a primary create-tenant entry point to the onboarding route', async () => {
    mockFetchTenantOverview.mockResolvedValue({ data: { totalTenants: 0, items: [] } });

    render(await DashboardPage());

    expect(
      screen.getByRole('heading', {
        name: /bảng điều khiển khởi tạo tenant/i,
      }),
    ).toBeInTheDocument();

    const createTenantLink = screen.getByRole('link', {
      name: /tạo tenant mới/i,
    });

    expect(createTenantLink).toHaveAttribute('href', '/setup/tenants/new');
    expect(
      screen.getByText(/bắt đầu onboarding tenant và branch đầu tiên/i),
    ).toBeInTheDocument();
  });

  it('displays tenant count and list when tenants exist', async () => {
    mockFetchTenantOverview.mockResolvedValue({
      data: {
        totalTenants: 1,
        items: [
          {
            tenantId: 'tenant-1',
            name: 'Blue Coral Retail',
            slug: 'blue-coral-retail',
            createdAt: '2024-01-01T00:00:00.000Z',
            defaultBranch: {
              branchId: 'branch-1',
              name: 'Chi nhanh Q1',
              slug: 'chi-nhanh-q1',
              code: 'Q1',
              readinessStatus: 'active',
            },
          },
        ],
      },
    });

    render(await DashboardPage());

    expect(screen.getByText('Blue Coral Retail')).toBeInTheDocument();
    expect(screen.getByText(/tổng cộng/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('preserves CTA primary action in populated state', async () => {
    mockFetchTenantOverview.mockResolvedValue({
      data: {
        totalTenants: 1,
        items: [
          {
            tenantId: 'tenant-1',
            name: 'Blue Coral',
            slug: 'blue-coral',
            createdAt: '2024-01-01T00:00:00.000Z',
            defaultBranch: null,
          },
        ],
      },
    });

    render(await DashboardPage());

    const createTenantLink = screen.getByRole('link', {
      name: /tạo tenant mới/i,
    });
    expect(createTenantLink).toHaveAttribute('href', '/setup/tenants/new');
  });

  it('shows empty state with CTA emphasis when no tenants exist', async () => {
    mockFetchTenantOverview.mockResolvedValue({ data: { totalTenants: 0, items: [] } });

    render(await DashboardPage());

    expect(screen.getByText(/chưa có tenant nào được tạo/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tạo tenant mới/i })).toBeInTheDocument();
  });

  it('preserves CTA primary action in empty state', async () => {
    mockFetchTenantOverview.mockResolvedValue({ data: { totalTenants: 0, items: [] } });

    render(await DashboardPage());

    const createTenantLink = screen.getByRole('link', {
      name: /tạo tenant mới/i,
    });
    expect(createTenantLink).toHaveAttribute('href', '/setup/tenants/new');
  });

  it('shows error state when API fails, without hiding CTA', async () => {
    mockFetchTenantOverview.mockRejectedValue(new Error('network error'));

    render(await DashboardPage());

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tạo tenant mới/i })).toBeInTheDocument();
  });

  it('preserves CTA primary action in error state', async () => {
    mockFetchTenantOverview.mockRejectedValue(new Error('server down'));

    render(await DashboardPage());

    const createTenantLink = screen.getByRole('link', {
      name: /tạo tenant mới/i,
    });
    expect(createTenantLink).toHaveAttribute('href', '/setup/tenants/new');
  });

  it('toggles summary panel when "Xem tóm tắt" button is clicked', async () => {
    mockFetchTenantOverview.mockResolvedValue({
      data: {
        totalTenants: 1,
        items: [
          {
            tenantId: 'tenant-1',
            name: 'Blue Coral',
            slug: 'blue-coral',
            createdAt: '2024-01-01T00:00:00.000Z',
            defaultBranch: {
              branchId: 'branch-1',
              name: 'Q1',
              slug: 'q1',
              code: 'Q1',
              readinessStatus: 'active',
            },
          },
        ],
      },
    });

    render(await DashboardPage());

    const toggleBtn = screen.getByRole('button', { name: /xem tóm tắt/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Chi nhánh mặc định')).toBeInTheDocument();
  });

  it('summary panel action does not navigate to any route — it expands in-page', async () => {
    mockFetchTenantOverview.mockResolvedValue({
      data: {
        totalTenants: 1,
        items: [
          {
            tenantId: 'tenant-2',
            name: 'Test Tenant',
            slug: 'test-tenant',
            createdAt: '2024-05-01T00:00:00.000Z',
            defaultBranch: null,
          },
        ],
      },
    });

    render(await DashboardPage());

    const toggleBtn = screen.getByRole('button', { name: /xem tóm tắt/i });
    expect(toggleBtn).not.toHaveAttribute('href');
  });
});

