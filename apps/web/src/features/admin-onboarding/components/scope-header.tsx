interface ScopeHeaderProps {
  branchId?: string;
  branchName?: string;
  currentStepLabel: string;
  readinessLabel: string;
  tenantId?: string;
  tenantName?: string;
}

export function ScopeHeader({
  branchId,
  branchName,
  currentStepLabel,
  readinessLabel,
  tenantId,
  tenantName,
}: ScopeHeaderProps) {
  const resolvedTenantName = tenantName ?? 'Tenant chưa được tạo';
  const resolvedBranchName = branchName ?? 'Branch mặc định đang chờ cấu hình';

  return (
    <section
      aria-label="Tenant và branch scope"
      className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
            Scope header placeholder
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Onboarding tenant mới
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Giữ tenant và branch context luôn hiển thị để các story sau mở rộng
            validation, readiness và publish flow mà không mơ hồ về scope.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Tenant
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              {resolvedTenantName}
            </p>
            {tenantId ? (
              <p className="mt-2 text-xs text-slate-400">ID: {tenantId}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Branch
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              {resolvedBranchName}
            </p>
            {branchId ? (
              <p className="mt-2 text-xs text-slate-400">ID: {branchId}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Bước hiện tại
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              {currentStepLabel}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Điều hướng theo wizard để giữ scope nhất quán.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Readiness hiện tại
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              {readinessLabel}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Luôn phản ánh trạng thái scope và tiến độ onboarding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
