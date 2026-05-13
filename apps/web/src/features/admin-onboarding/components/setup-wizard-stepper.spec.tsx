import { fireEvent, render, screen, within } from '@testing-library/react';
import { SetupStepper } from './setup-wizard-stepper';

describe('SetupWizardStepper', () => {
  it('renders accessible step buttons, current step metadata, and keeps blocked steps disabled', () => {
    const onStepSelect = jest.fn();

    render(
      <SetupStepper
        onStepSelect={onStepSelect}
        steps={[
          {
            detail: 'Tenant basics đã bắt đầu.',
            state: 'active',
            title: 'Tenant cơ bản',
          },
          {
            blockingReason: 'Hoàn tất thông tin tenant để mở khóa bước branch.',
            detail: 'Bước branch đang chờ điều kiện.',
            state: 'blocked',
            title: 'Branch đầu tiên',
          },
        ]}
      />,
    );

    const stepper = screen.getByRole('navigation', {
      name: /tiến trình onboarding tenant/i,
    });

    expect(
      within(stepper).getByRole('button', {
        name: /mở bước tenant cơ bản/i,
      }),
    ).toHaveAttribute('aria-current', 'step');
    expect(within(stepper).getAllByText(/bị chặn/i)).not.toHaveLength(0);
    expect(
      within(stepper).getByText(/lý do bị chặn: hoàn tất thông tin tenant/i),
    ).toBeInTheDocument();

    const blockedStepButton = within(stepper).getByRole('button', {
      name: /mở bước branch đầu tiên/i,
    });

    expect(blockedStepButton).toBeDisabled();

    fireEvent.click(blockedStepButton);

    expect(onStepSelect).not.toHaveBeenCalled();
  });

  it('lets ready steps be selected explicitly', () => {
    const onStepSelect = jest.fn();

    render(
      <SetupStepper
        onStepSelect={onStepSelect}
        steps={[
          {
            detail: 'Tenant basics đã hoàn tất.',
            state: 'completed',
            title: 'Tenant cơ bản',
          },
          {
            detail: 'Branch đã sẵn sàng để kiểm tra readiness.',
            state: 'ready',
            title: 'Branch đầu tiên',
          },
        ]}
      />,
    );

    const readyStepButton = screen.getByRole('button', {
      name: /mở bước branch đầu tiên/i,
    });

    expect(readyStepButton).toBeEnabled();

    fireEvent.click(readyStepButton);

    expect(onStepSelect).toHaveBeenCalledWith('Branch đầu tiên');
  });
});
