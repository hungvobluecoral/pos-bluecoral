import { CreateTenantEntry } from '../../../features/admin-onboarding/components/create-tenant-entry';
import { TenantOverviewSection } from '../../../features/dashboard/components/tenant-overview-section';

export default function LoadingDashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10">
      <header className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-200">
          POS_BlueCoral Admin
        </p>
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Workspace foundation cho guided tenant onboarding
          </h1>
          <p className="text-lg text-slate-300">
            Trang dashboard ưu tiên một entry point rõ ràng để system admin bắt
            đầu flow tenant + branch scope-aware.
          </p>
        </div>
      </header>

      <CreateTenantEntry />

      <TenantOverviewSection data={null} error={null} isLoading />
    </main>
  );
}
