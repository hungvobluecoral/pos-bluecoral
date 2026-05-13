type StepState = 'active' | 'blocked' | 'completed' | 'ready' | 'warning';

const stateClasses: Record<StepState, string> = {
  active: 'border-cyan-300 bg-cyan-400/10 text-cyan-100',
  blocked: 'border-amber-300 bg-amber-400/10 text-amber-100',
  completed: 'border-emerald-300 bg-emerald-400/10 text-emerald-100',
  ready: 'border-emerald-300 bg-emerald-400/10 text-emerald-100',
  warning: 'border-violet-300 bg-violet-400/10 text-violet-100',
};

interface SetupStepperProps {
  hasProvisionedContext?: boolean;
}

export function SetupStepper({ hasProvisionedContext }: SetupStepperProps) {
  const setupSteps: Array<{
    detail: string;
    state: StepState;
    title: string;
  }> = hasProvisionedContext
    ? [
        {
          title: 'Tenant cơ bản',
          detail: 'Tenant đầu tiên đã được provision và scope đã được khóa.',
          state: 'completed',
        },
        {
          title: 'Branch đầu tiên',
          detail: 'Context branch đã sẵn sàng để Story 1.3 mở rộng wizard.',
          state: 'active',
        },
        {
          title: 'Review và publish',
          detail: 'Readiness panel đang chờ các bước tiếp theo của onboarding.',
          state: 'warning',
        },
      ]
    : [
        {
          title: 'Tenant cơ bản',
          detail: 'Thu thập thông tin nền để mở rộng story 1.2.',
          state: 'active',
        },
        {
          title: 'Branch đầu tiên',
          detail: 'Giữ scope branch rõ ràng trước khi publish.',
          state: 'blocked',
        },
        {
          title: 'Review và publish',
          detail: 'Readiness panel sẽ tổng hợp các điều kiện go-live.',
          state: 'ready',
        },
      ];

  return (
    <nav
      aria-label="Tiến trình onboarding tenant"
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Stepper placeholder</h2>
        <span className="text-sm text-slate-400">Story 1.1 foundation</span>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {setupSteps.map((step, index) => (
          <li
            key={step.title}
            aria-current={step.state === 'active' ? 'step' : undefined}
            className={`rounded-2xl border p-4 ${stateClasses[step.state]}`}
          >
            <div className="mb-2 flex items-center justify-between text-sm font-medium">
              <span>Bước {index + 1}</span>
              <span>{step.state}</span>
            </div>
            <p className="text-base font-semibold">{step.title}</p>
            <p className="mt-2 text-sm text-slate-200/90">{step.detail}</p>
          </li>
        ))}
      </ol>
    </nav>
  );
}
