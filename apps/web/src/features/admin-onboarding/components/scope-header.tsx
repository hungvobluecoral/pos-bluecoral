export function ScopeHeader() {
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Tenant
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              Tenant chưa được tạo
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Branch
            </p>
            <p className="mt-2 text-base font-semibold text-white">
              Branch mặc định đang chờ cấu hình
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
