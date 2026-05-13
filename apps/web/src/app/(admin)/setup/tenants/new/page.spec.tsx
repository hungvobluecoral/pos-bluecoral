import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TenantSetupPage from './page';

const originalFetch = global.fetch;

describe('Tenant onboarding shell', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('renders the provisioning form while preserving the onboarding shell', () => {
    render(<TenantSetupPage />);

    expect(
      screen.getByRole('heading', {
        name: /onboarding tenant mới/i,
      }),
    ).toBeInTheDocument();

    const stepper = screen.getByRole('navigation', {
      name: /tiến trình onboarding tenant/i,
    });
    expect(stepper).toBeInTheDocument();
    expect(within(stepper).getByText(/tenant cơ bản/i)).toBeInTheDocument();
    expect(within(stepper).getByText(/branch đầu tiên/i)).toBeInTheDocument();
    expect(within(stepper).getByText(/review và publish/i)).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /tên tenant/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /slug tenant/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /tên branch đầu tiên/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /lưu tenant và branch/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('region', {
        name: /tenant và branch scope/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/tenant chưa được tạo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/branch mặc định đang chờ cấu hình/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('complementary', {
        name: /bảng readiness tenant/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/xác nhận scope tenant\/branch/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/kiểm tra local stack/i)).toBeInTheDocument();
    expect(
      screen.getByText(/swagger và contract scaffold/i),
    ).toBeInTheDocument();
  });

  it('updates the scope header after provisioning succeeds', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          tenantId: 'tenant-001',
          branchId: 'branch-001',
          tenant: {
            name: 'Blue Coral Retail',
            slug: 'blue-coral-retail',
          },
          branch: {
            name: 'Chi nhanh Quan 1',
            slug: 'chi-nhanh-quan-1',
            code: 'Q1',
          },
        },
        meta: {
          requestId: 'req-001',
          scope: 'system-admin',
        },
      }),
    });

    render(<TenantSetupPage />);

    fireEvent.change(screen.getByLabelText(/tên tenant/i), {
      target: { value: 'Blue Coral Retail' },
    });
    fireEvent.change(screen.getByLabelText(/slug tenant/i), {
      target: { value: 'blue-coral-retail' },
    });
    fireEvent.change(screen.getByLabelText(/tên branch đầu tiên/i), {
      target: { value: 'Chi nhanh Quan 1' },
    });
    fireEvent.change(screen.getByLabelText(/slug branch/i), {
      target: { value: 'chi-nhanh-quan-1' },
    });
    fireEvent.change(screen.getByLabelText(/mã branch/i), {
      target: { value: 'Q1' },
    });
    fireEvent.change(screen.getByLabelText(/locale/i), {
      target: { value: 'vi-VN' },
    });
    fireEvent.change(screen.getByLabelText(/currency/i), {
      target: { value: 'VND' },
    });
    fireEvent.change(screen.getByLabelText(/timezone/i), {
      target: { value: 'Asia/Ho_Chi_Minh' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /lưu tenant và branch/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('Blue Coral Retail')).toBeInTheDocument();
      expect(screen.getByText(/chi nhanh quan 1/i)).toBeInTheDocument();
    });
  });

  it('shows inline validation errors and skips the network call for empty required fields', async () => {
    render(<TenantSetupPage />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /lưu tenant và branch/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/tên tenant là bắt buộc/i)).toBeInTheDocument();
      expect(screen.getByText(/slug tenant là bắt buộc/i)).toBeInTheDocument();
      expect(
        screen.getByText(/tên branch đầu tiên là bắt buộc/i),
      ).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('Tenant onboarding shell test isolation', () => {
  it('restores the original fetch after each onboarding test', () => {
    expect(global.fetch).toBe(originalFetch);
  });
});
