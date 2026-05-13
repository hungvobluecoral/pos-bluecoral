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
    expect(
      within(stepper).getByText(/readiness và kiểm tra/i),
    ).toBeInTheDocument();
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
      screen.getByText(/thông tin tenant cơ bản/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/thông tin branch đầu tiên/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/khóa scope từ provisioning result/i),
    ).toBeInTheDocument();
  });

  it('keeps current scope and wizard step visible while moving from tenant basics to branch setup', () => {
    render(<TenantSetupPage />);

    const scopeHeader = screen.getByRole('region', {
      name: /tenant và branch scope/i,
    });

    expect(within(scopeHeader).getByText(/bước hiện tại/i)).toBeInTheDocument();
    expect(within(scopeHeader).getByText(/tenant cơ bản/i)).toBeInTheDocument();
    expect(
      within(scopeHeader).getByText(/readiness hiện tại/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/tên tenant/i), {
      target: { value: 'Blue Coral Retail' },
    });
    fireEvent.change(screen.getByLabelText(/slug tenant/i), {
      target: { value: 'blue-coral-retail' },
    });
    fireEvent.change(screen.getByLabelText(/tên branch đầu tiên/i), {
      target: { value: 'Chi nhanh Quan 1' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /tiếp tục tới bước branch/i,
      }),
    );

    expect(
      within(scopeHeader).getByText(/blue coral retail/i),
    ).toBeInTheDocument();
    expect(
      within(scopeHeader).getByText(/chi nhanh quan 1/i),
    ).toBeInTheDocument();
    expect(
      within(scopeHeader).getByText(/branch đầu tiên/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /cấu hình branch đầu tiên/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows human-readable step statuses and keeps blocked steps disabled in the stepper', () => {
    render(<TenantSetupPage />);

    const stepper = screen.getByRole('navigation', {
      name: /tiến trình onboarding tenant/i,
    });

    expect(within(stepper).getByText(/đang thực hiện/i)).toBeInTheDocument();
    expect(within(stepper).getAllByText(/bị chặn/i)).not.toHaveLength(0);
    expect(
      within(stepper).getByText(
        /lý do bị chặn: hoàn tất thông tin tenant để mở khóa bước branch/i,
      ),
    ).toBeInTheDocument();
    expect(
      within(stepper).getByRole('button', {
        name: /mở bước branch đầu tiên/i,
      }),
    ).toBeDisabled();
  });

  it('moves focus to the new step heading after the wizard advances', () => {
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

    fireEvent.click(
      screen.getByRole('button', {
        name: /tiếp tục tới bước branch/i,
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: /cấu hình branch đầu tiên/i,
      }),
    ).toHaveFocus();
  });

  it('summarizes readiness checks and lets the admin jump to the related step from the panel', () => {
    render(<TenantSetupPage />);

    const readinessPanel = screen.getByRole('complementary', {
      name: /bảng readiness tenant/i,
    });

    expect(
      within(readinessPanel).getByText(/thông tin tenant cơ bản/i),
    ).toBeInTheDocument();
    expect(
      within(readinessPanel).getByRole('button', {
        name: /mở bước branch đầu tiên/i,
      }),
    ).toBeDisabled();
  });

  it('describes readiness impact next to inline validation when required fields are missing', async () => {
    render(<TenantSetupPage />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /lưu tenant và branch/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/tên tenant là bắt buộc\. scope chưa thể sẵn sàng\./i),
      ).toBeInTheDocument();
    });

    expect(
      within(
        screen.getByRole('complementary', {
          name: /bảng readiness tenant/i,
        }),
      ).getByText(/thiếu tên tenant nên scope chưa thể sẵn sàng/i),
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
      const scopeHeader = screen.getByRole('region', {
        name: /tenant và branch scope/i,
      });

      expect(within(scopeHeader).getByText('Blue Coral Retail')).toBeInTheDocument();
      expect(within(scopeHeader).getByText(/chi nhanh quan 1/i)).toBeInTheDocument();
      expect(
        within(scopeHeader).getByText(/readiness và kiểm tra/i),
      ).toBeInTheDocument();
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
      expect(
        screen.getByText(/^Tên tenant là bắt buộc\. Scope chưa thể sẵn sàng\.$/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/^Slug tenant là bắt buộc\. Scope chưa thể sẵn sàng\.$/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /^Tên branch đầu tiên là bắt buộc\. Readiness chưa thể hoàn tất\.$/i,
        ),
      ).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows a true ready state in the readiness panel once all local data is valid', () => {
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

    expect(
      within(
        screen.getByRole('complementary', {
          name: /bảng readiness tenant/i,
        }),
      ).getByText(/sẵn sàng/i),
    ).toBeInTheDocument();
  });

  it('syncs server-side field errors back into the readiness checklist', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          code: 'tenantSlugTaken',
          message: 'Không thể lưu tenant/branch.',
          details: [
            {
              field: 'tenantSlug',
              message: 'Slug tenant đã tồn tại.',
            },
          ],
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

    fireEvent.click(
      screen.getByRole('button', {
        name: /lưu tenant và branch/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/^Slug tenant đã tồn tại\. Scope chưa thể sẵn sàng\.$/i),
      ).toBeInTheDocument();
    });

    expect(
      within(
        screen.getByRole('complementary', {
          name: /bảng readiness tenant/i,
        }),
      ).getByText(/slug tenant đã tồn tại nên scope chưa thể sẵn sàng/i),
    ).toBeInTheDocument();
  });

  it('lets tablet users collapse and reopen supporting panels without losing context', () => {
    render(<TenantSetupPage />);

    const collapseStepperButton = screen.getByRole('button', {
      name: /thu gọn tiến trình onboarding/i,
    });
    const collapseReadinessButton = screen.getByRole('button', {
      name: /thu gọn readiness panel/i,
    });

    expect(collapseStepperButton).toHaveAttribute('aria-expanded', 'true');
    expect(collapseReadinessButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(collapseStepperButton);
    fireEvent.click(collapseReadinessButton);

    expect(collapseStepperButton).toHaveAttribute('aria-expanded', 'false');
    expect(collapseReadinessButton).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('region', {
        name: /tenant và branch scope/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/story 1\.1 foundation/i)).not.toBeInTheDocument();
  });
});

describe('Tenant onboarding shell test isolation', () => {
  it('restores the original fetch after each onboarding test', () => {
    expect(global.fetch).toBe(originalFetch);
  });
});
