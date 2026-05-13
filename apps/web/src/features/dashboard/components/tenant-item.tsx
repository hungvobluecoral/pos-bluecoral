'use client';

import { useState } from 'react';
import type {
  TenantOverviewItem,
  TenantReadinessStatus,
} from '@pos-bluecoral/contracts';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';

const READINESS_LABEL: Record<TenantReadinessStatus, string> = {
  active: 'Hoạt động',
  ready: 'Sẵn sàng',
  completed: 'Hoàn tất',
  warning: 'Cảnh báo',
  blocked: 'Bị chặn',
};

function readinessLabel(status: TenantReadinessStatus): string {
  return READINESS_LABEL[status];
}

function readinessBadgeClass(status: TenantReadinessStatus): string {
  switch (status) {
    case 'active':
    case 'ready':
    case 'completed':
      return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
    case 'warning':
      return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
    case 'blocked':
    default:
      return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
  }
}

export function TenantItem({ item }: { item: TenantOverviewItem }) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  const toggleSummary = () => setSummaryOpen((prev) => !prev);

  return (
    <li className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0 text-cyan-400" aria-hidden="true" />
            <span className="font-semibold text-white">{item.name}</span>
          </div>
          <p className="text-sm text-slate-400">
            Slug: <code className="text-slate-300">{item.slug}</code>
          </p>
          <p className="text-xs text-slate-500">
            Tạo lúc:{' '}
            {new Date(item.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleSummary}
          aria-expanded={summaryOpen}
          aria-controls={`summary-${item.tenantId}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
        >
          Xem tóm tắt
          {summaryOpen ? (
            <ChevronUp className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id={`summary-${item.tenantId}`}
        role="region"
        aria-label={`Tóm tắt tenant ${item.name}`}
        hidden={!summaryOpen}
        className="mt-4 rounded-xl border border-white/5 bg-slate-800/50 p-4"
      >
        {item.defaultBranch ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Chi nhánh mặc định
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-200">
                {item.defaultBranch.name}
              </span>
              <code className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
                {item.defaultBranch.code}
              </code>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${readinessBadgeClass(item.defaultBranch.readinessStatus)}`}
              >
                {readinessLabel(item.defaultBranch.readinessStatus)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Slug: <code className="text-slate-400">{item.defaultBranch.slug}</code>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chưa có chi nhánh mặc định.</p>
        )}
      </div>
    </li>
  );
}
