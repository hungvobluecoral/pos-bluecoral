import { render, screen } from '@testing-library/react';
import { ScopeHeader } from './scope-header';

describe('ScopeHeader', () => {
  it('renders tenant, branch, current step, and readiness summary together', () => {
    render(
      <ScopeHeader
        branchId="branch-001"
        branchName="Chi nhanh Quan 1"
        currentStepLabel="Branch đầu tiên"
        readinessLabel="Đang hoàn thiện"
        tenantId="tenant-001"
        tenantName="Blue Coral Retail"
      />,
    );

    expect(screen.getByText(/blue coral retail/i)).toBeInTheDocument();
    expect(screen.getByText(/chi nhanh quan 1/i)).toBeInTheDocument();
    expect(screen.getByText(/bước hiện tại/i)).toBeInTheDocument();
    expect(screen.getByText(/branch đầu tiên/i)).toBeInTheDocument();
    expect(screen.getByText(/readiness hiện tại/i)).toBeInTheDocument();
    expect(screen.getByText(/đang hoàn thiện/i)).toBeInTheDocument();
  });
});
