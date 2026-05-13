import { buttonClassName } from '../../../components/ui/button';
import type { ReadinessItem } from './readiness-panel';

export type ReviewSummaryState = 'blocked' | 'review-ready' | 'success' | 'warning';

const reviewStateLabels: Record<ReviewSummaryState, string> = {
  blocked: 'Bị chặn',
  'review-ready': 'Sẵn sàng publish',
  success: 'Đã publish',
  warning: 'Cần chú ý',
};

type ReadinessState = 'blocked' | 'completed' | 'ready' | 'warning';

const readinessStateLabels: Record<ReadinessState, string> = {
  blocked: 'Bị chặn',
  completed: 'Đã hoàn tất',
  ready: 'Sẵn sàng',
  warning: 'Cần chú ý',
};

const readinessStateDotClasses: Record<ReadinessState, string> = {
  blocked: 'bg-amber-300',
  completed: 'bg-emerald-300',
  ready: 'bg-cyan-300',
  warning: 'bg-violet-300',
};

interface ReviewSummaryField {
  label: string;
  value: string;
}

interface CapabilityImpact {
  detail: string;
  title: string;
}

interface ReviewSummaryPanelProps {
  capabilityImpacts: CapabilityImpact[];
  changedItems: ReviewSummaryField[];
  onPublish: () => void;
  readinessItems: ReadinessItem[];
  riskNote: string;
  state: ReviewSummaryState;
  summary: {
    branch: ReviewSummaryField[];
    config: ReviewSummaryField[];
    tenant: ReviewSummaryField[];
  };
}

function SummaryGrid({
  items,
  title,
}: {
  items: ReviewSummaryField[];
  title: string;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
        {title}
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="space-y-1">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">
              {item.label}
            </dt>
            <dd className="text-sm font-medium text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReviewSummaryPanel({
  capabilityImpacts,
  changedItems,
  onPublish,
  readinessItems,
  riskNote,
  state,
  summary,
}: ReviewSummaryPanelProps) {
  return (
    <section
      aria-label="Review summary panel"
      className="space-y-5 rounded-2xl border border-cyan-400/30 bg-slate-950/70 p-5"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
          Review summary panel
        </p>
        <h3 className="text-2xl font-semibold text-white">Review trước khi publish</h3>
        <p className="text-sm text-slate-300">
          Xác nhận tenant, branch, readiness và capability bị ảnh hưởng trước khi
          đưa branch đầu tiên vào trạng thái vận hành.
        </p>
        <p className="text-sm font-medium text-emerald-200">
          Trạng thái review: {reviewStateLabels[state]}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryGrid items={summary.tenant} title="Tenant summary" />
        <SummaryGrid items={summary.branch} title="Branch summary" />
        <SummaryGrid items={summary.config} title="Config summary" />
      </div>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
          Changed items
        </h3>
        <ul className="grid gap-3 md:grid-cols-2">
          {changedItems.map((item) => (
            <li
              key={`changed-${item.label}`}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-3"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Readiness breakdown"
        className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
          Readiness breakdown
        </h3>
        <ul className="grid gap-3 md:grid-cols-3">
          {readinessItems.map((item) => (
            <li
              key={`readiness-${item.title}`}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${readinessStateDotClasses[item.state]}`}
                />
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
                  {readinessStateLabels[item.state]}
                </p>
              </div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-300">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
          Capability impact
        </h3>
        <ul className="grid gap-3 md:grid-cols-2">
          {capabilityImpacts.map((impact) => (
            <li
              key={impact.title}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-3"
            >
              <p className="text-sm font-medium text-white">{impact.title}</p>
              <p className="mt-1 text-sm text-slate-300">{impact.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-100">
          Risk note
        </h3>
        <p className="mt-2 text-sm text-slate-100">{riskNote}</p>
      </section>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300">
          Primary action chỉ nên được dùng khi admin đã hiểu rõ scope và readiness.
        </p>
        <button
          className={buttonClassName({ size: 'lg' })}
          disabled={state === 'blocked' || state === 'success'}
          type="button"
          onClick={state === 'blocked' || state === 'success' ? undefined : onPublish}
        >
          Publish tenant và branch
        </button>
      </div>
    </section>
  );
}
