interface ReadinessPanelProps {
  hasProvisionedContext?: boolean;
  readinessItems?: {
    contractReady: boolean;
    scopeReady: boolean;
  };
}

export function ReadinessPanel({
  hasProvisionedContext,
  readinessItems,
}: ReadinessPanelProps) {
  const resolvedReadiness = readinessItems ?? {
    contractReady: false,
    scopeReady: false,
  };

  const items = [
    {
      description: hasProvisionedContext
        ? 'Tenant/branch context đã được cập nhật từ response provisioning.'
        : 'Placeholder cho checklist scope-aware/readiness-aware.',
      done: resolvedReadiness.scopeReady,
      title: 'Xác nhận scope tenant/branch',
    },
    {
      description: 'Docker dev stack vẫn là baseline để kiểm tra local runtime.',
      done: true,
      title: 'Kiểm tra local stack',
    },
    {
      description: hasProvisionedContext
        ? 'Provisioning API đã trả envelope chuẩn để wizard bước sau tiêu thụ.'
        : 'Placeholder cho checklist scope-aware/readiness-aware.',
      done: resolvedReadiness.contractReady,
      title: 'Swagger và contract scaffold',
    },
  ];

  return (
    <aside
      aria-label="Bảng readiness tenant"
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">
          Readiness panel placeholder
        </p>
        <h2 className="text-xl font-semibold text-white">
          Các điều kiện cần trước khi publish
        </h2>
        <p className="text-sm text-slate-300">
          Story 1.1 chỉ scaffold narrative để story sau nối tiếp data thật,
          validation và trạng thái go-live.
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
              className={`mt-1 size-2 rounded-full ${
                item.done ? 'bg-emerald-300' : 'bg-amber-300'
              }`}
            />
            <div>
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
