import { buttonClassName } from '../../../components/ui/button';

type ReadinessState = 'blocked' | 'completed' | 'ready' | 'warning';

const stateClasses: Record<ReadinessState, string> = {
  blocked: 'bg-amber-300',
  completed: 'bg-emerald-300',
  ready: 'bg-cyan-300',
  warning: 'bg-violet-300',
};

const stateLabels: Record<ReadinessState, string> = {
  blocked: 'Bị chặn',
  completed: 'Đã hoàn tất',
  ready: 'Sẵn sàng',
  warning: 'Cần chú ý',
};

export interface ReadinessItem {
  actionLabel?: string;
  actionDisabled?: boolean;
  description: string;
  onAction?: () => void;
  state: ReadinessState;
  title: string;
}

interface ReadinessPanelProps {
  items: ReadinessItem[];
}

export function ReadinessPanel({ items }: ReadinessPanelProps) {

  return (
    <aside
      aria-label="Bảng readiness tenant"
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">
          Readiness panel
        </p>
        <h2 className="text-xl font-semibold text-white">
          Các điều kiện readiness của guided wizard
        </h2>
        <p className="text-sm text-slate-300">
          Checklist này luôn phản chiếu tình trạng scope, validation và bước cần
          quay lại để sửa.
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <span
              aria-hidden="true"
              className={`mt-1 size-2 rounded-full ${stateClasses[item.state]}`}
            />
            <div className="space-y-3">
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {stateLabels[item.state]}
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {item.description}
              </p>
              {item.actionLabel && item.onAction ? (
                <button
                  className={buttonClassName({ size: 'default', variant: 'secondary' })}
                  disabled={item.actionDisabled}
                  type="button"
                  onClick={item.onAction}
                >
                  {item.actionLabel}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
