import { render, screen } from '@testing-library/react';
import { TenantOverviewSection } from './tenant-overview-section';

describe('TenantOverviewSection', () => {
  it('shows a loading state while tenant overview is being fetched', () => {
    render(
      <TenantOverviewSection
        data={null}
        error={null}
        {...({ isLoading: true } as { isLoading: boolean })}
      />,
    );

    expect(screen.getByText(/đang tải tenant overview/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
