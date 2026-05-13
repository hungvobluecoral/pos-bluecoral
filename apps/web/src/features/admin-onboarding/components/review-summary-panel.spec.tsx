import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReadinessItem } from './readiness-panel';
import { ReviewSummaryPanel } from './review-summary-panel';

const baseReadinessItems: ReadinessItem[] = [
  {
    description: 'Thông tin tenant đã đủ để khóa context.',
    state: 'completed',
    title: 'Thông tin tenant cơ bản',
  },
  {
    description: 'Branch mặc định đã có đủ dữ liệu.',
    state: 'completed',
    title: 'Thông tin branch đầu tiên',
  },
  {
    description: 'Dữ liệu đã đủ để lưu và khóa scope.',
    state: 'ready',
    title: 'Khóa scope từ provisioning result',
  },
];

const baseProps = {
  capabilityImpacts: [
    { detail: 'Scope nền cho các module sau.', title: 'Tenant governance' },
    { detail: 'Mở khi branch đã được review rõ ràng.', title: 'Branch checkout' },
  ],
  changedItems: [
    { label: 'Tenant name', value: 'Blue Coral Retail' },
  ],
  onPublish: jest.fn(),
  readinessItems: baseReadinessItems,
  riskNote: 'Kiểm tra scope và readiness trước khi publish.',
  summary: {
    branch: [{ label: 'Tên branch', value: 'Chi nhánh Q1' }],
    config: [{ label: 'Locale', value: 'vi-VN' }],
    tenant: [{ label: 'Tên tenant', value: 'Blue Coral Retail' }],
  },
};

describe('ReviewSummaryPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enables the publish button when state is review-ready', () => {
    render(<ReviewSummaryPanel {...baseProps} state="review-ready" />);

    const publishButton = screen.getByRole('button', {
      name: /publish tenant và branch/i,
    });

    expect(publishButton).toBeEnabled();

    fireEvent.click(publishButton);

    expect(baseProps.onPublish).toHaveBeenCalledTimes(1);
  });

  it('disables the publish button and does not invoke onPublish when state is blocked', () => {
    render(<ReviewSummaryPanel {...baseProps} state="blocked" />);

    const publishButton = screen.getByRole('button', {
      name: /publish tenant và branch/i,
    });

    expect(publishButton).toBeDisabled();

    fireEvent.click(publishButton);

    expect(baseProps.onPublish).not.toHaveBeenCalled();
  });

  it('disables the publish button when state is success', () => {
    render(<ReviewSummaryPanel {...baseProps} state="success" />);

    expect(
      screen.getByRole('button', { name: /publish tenant và branch/i }),
    ).toBeDisabled();
  });

  it('shows the review state label prominently', () => {
    render(<ReviewSummaryPanel {...baseProps} state="blocked" />);

    expect(screen.getByText(/bị chặn/i)).toBeInTheDocument();
  });

  it('displays readiness state labels inside the readiness breakdown section', () => {
    render(
      <ReviewSummaryPanel
        {...baseProps}
        state="blocked"
        readinessItems={[
          {
            description: 'Thiếu tên tenant.',
            state: 'blocked',
            title: 'Thông tin tenant cơ bản',
          },
          {
            description: 'Branch đã đủ dữ liệu.',
            state: 'completed',
            title: 'Thông tin branch đầu tiên',
          },
          {
            description: 'Dữ liệu đủ để khóa scope.',
            state: 'ready',
            title: 'Khóa scope từ provisioning result',
          },
        ]}
      />,
    );

    const breakdown = screen.getByRole('region', { name: /readiness breakdown/i });

    expect(within(breakdown).getByText(/bị chặn/i)).toBeInTheDocument();
    expect(within(breakdown).getByText(/đã hoàn tất/i)).toBeInTheDocument();
    expect(within(breakdown).getByText(/sẵn sàng/i)).toBeInTheDocument();
  });

  it('renders summary blocks for tenant, branch, and config', () => {
    render(<ReviewSummaryPanel {...baseProps} state="review-ready" />);

    expect(screen.getByText(/tenant summary/i)).toBeInTheDocument();
    expect(screen.getByText(/branch summary/i)).toBeInTheDocument();
    expect(screen.getByText(/config summary/i)).toBeInTheDocument();
  });

  it('renders capability impact items and links them to the readiness checklist context', () => {
    render(<ReviewSummaryPanel {...baseProps} state="review-ready" />);

    const panel = screen.getByRole('region', { name: /review summary panel/i });

    expect(within(panel).getByText('Tenant governance')).toBeInTheDocument();
    expect(within(panel).getByText('Branch checkout')).toBeInTheDocument();
  });

  it('renders the risk note', () => {
    render(<ReviewSummaryPanel {...baseProps} state="review-ready" />);

    expect(
      screen.getByText(/kiểm tra scope và readiness trước khi publish/i),
    ).toBeInTheDocument();
  });
});
