const readinessItems = [
  'Xác nhận scope tenant/branch',
  'Kiểm tra local stack',
  'Swagger và contract scaffold',
] as const;

export function ReadinessPanel() {
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
        {readinessItems.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <span
              aria-hidden="true"
              className="mt-1 size-2 rounded-full bg-amber-300"
            />
            <div>
              <p className="font-medium text-white">{item}</p>
              <p className="mt-1 text-sm text-slate-400">
                Placeholder cho checklist scope-aware/readiness-aware.
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
