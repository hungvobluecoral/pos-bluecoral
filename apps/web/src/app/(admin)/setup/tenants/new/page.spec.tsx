import { render, screen } from '@testing-library/react';
import TenantSetupPage from './page';

describe('Tenant onboarding shell', () => {
  it('renders the stepper, scope header, and readiness panel placeholders', () => {
    render(<TenantSetupPage />);

    expect(
      screen.getByRole('heading', {
        name: /onboarding tenant mới/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', {
        name: /tiến trình onboarding tenant/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/tenant cơ bản/i)).toBeInTheDocument();
    expect(screen.getByText(/branch đầu tiên/i)).toBeInTheDocument();
    expect(screen.getByText(/review và publish/i)).toBeInTheDocument();

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
});
