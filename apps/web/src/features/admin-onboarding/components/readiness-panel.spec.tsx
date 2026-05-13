import { fireEvent, render, screen } from '@testing-library/react';
import { ReadinessPanel } from './readiness-panel';

describe('ReadinessPanel', () => {
  it('renders readiness statuses and action links back to the relevant step', () => {
    const onTenantAction = jest.fn();

    render(
      <ReadinessPanel
        items={[
          {
            actionLabel: 'Mở bước tenant cơ bản',
            description: 'Thiếu tên tenant nên scope chưa thể sẵn sàng.',
            onAction: onTenantAction,
            state: 'blocked',
            title: 'Thông tin tenant cơ bản',
          },
          {
            description: 'TenantId và branchId đã được khóa từ provisioning result.',
            state: 'completed',
            title: 'Khóa scope từ provisioning result',
          },
        ]}
      />,
    );

    expect(screen.getByText(/thông tin tenant cơ bản/i)).toBeInTheDocument();
    expect(screen.getByText(/bị chặn/i)).toBeInTheDocument();
    expect(
      screen.getByText(/khóa scope từ provisioning result/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/đã hoàn tất/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: /mở bước tenant cơ bản/i,
      }),
    );

    expect(onTenantAction).toHaveBeenCalled();
  });
});
