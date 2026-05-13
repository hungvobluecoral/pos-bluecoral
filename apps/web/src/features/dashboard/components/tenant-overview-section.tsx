import type { TenantOverviewResult } from '@pos-bluecoral/contracts';
import { TenantItem } from './tenant-item';

interface TenantOverviewSectionProps {
  data: TenantOverviewResult | null;
  error: string | null;
  isLoading?: boolean;
}

export function TenantOverviewSection({
  data,
  error,
  isLoading = false,
}: TenantOverviewSectionProps) {
  return (
    <section
      aria-label="Danh sách tenant đã tạo"
      className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Tenant đã tạo
        </h2>
        {data !== null && (
          <span className="text-sm text-slate-400">
            Tổng cộng:{' '}
            <strong className="text-slate-200">{data.totalTenants}</strong>
          </span>
        )}
      </div>

      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-white/5 bg-slate-800/30 p-6"
        >
          <p className="text-sm text-slate-300">Đang tải tenant overview...</p>
        </div>
      )}

      {error !== null && (
        <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {!isLoading && data !== null && data.items.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-slate-800/30 p-6 text-center">
          <p className="text-sm text-slate-400">
            Chưa có tenant nào được tạo. Sử dụng nút{' '}
            <strong className="text-slate-200">Tạo tenant mới</strong> bên trên để bắt đầu.
          </p>
        </div>
      )}

      {!isLoading && data !== null && data.items.length > 0 && (
        <ul className="space-y-3" aria-label="Danh sách tenant">
          {data.items.map((item) => (
            <TenantItem key={item.tenantId} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
