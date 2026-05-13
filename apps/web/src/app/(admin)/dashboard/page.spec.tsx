import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

describe('Admin dashboard page', () => {
  it('renders a primary create-tenant entry point to the onboarding route', () => {
    render(<DashboardPage />);

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
});
