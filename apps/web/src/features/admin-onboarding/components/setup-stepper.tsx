import { buttonClassName } from '../../../components/ui/button';

type StepState = 'active' | 'blocked' | 'completed' | 'ready' | 'warning';

const stateLabels: Record<StepState, string> = {
  active: 'Đang thực hiện',
  blocked: 'Bị chặn',
  completed: 'Đã hoàn tất',
  ready: 'Sẵn sàng',
  warning: 'Cần chú ý',
};

const stateClasses: Record<StepState, string> = {
  active: 'border-cyan-300 bg-cyan-400/10 text-cyan-100',
  blocked: 'border-amber-300 bg-amber-400/10 text-amber-100',
  completed: 'border-emerald-300 bg-emerald-400/10 text-emerald-100',
  ready: 'border-emerald-300 bg-emerald-400/10 text-emerald-100',
  warning: 'border-violet-300 bg-violet-400/10 text-violet-100',
};

export interface SetupStep {
  blockingReason?: string;
  detail: string;
  state: StepState;
  title: string;
}

interface SetupStepperProps {
  onStepSelect?: (stepTitle: string) => void;
  steps: SetupStep[];
}

export function SetupStepper({ onStepSelect, steps }: SetupStepperProps) {
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
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={step.state === 'active' ? 'step' : undefined}
            className={`rounded-2xl border p-4 ${stateClasses[step.state]}`}
          >
            <div className="mb-2 flex items-center justify-between text-sm font-medium">
              <span>Bước {index + 1}</span>
              <span>{stateLabels[step.state]}</span>
            </div>
            <button
              aria-current={step.state === 'active' ? 'step' : undefined}
              className={buttonClassName({ size: 'default', variant: 'secondary' })}
              disabled={step.state === 'blocked'}
              type="button"
              onClick={() => onStepSelect?.(step.title)}
            >
              Mở bước {step.title}
            </button>
            <p className="mt-2 text-sm text-slate-200/90">{step.detail}</p>
            {step.blockingReason ? (
              <p className="mt-3 text-sm text-slate-100">
                Lý do bị chặn: {step.blockingReason}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
