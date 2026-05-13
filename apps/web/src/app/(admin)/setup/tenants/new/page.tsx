import { ReadinessPanel } from '../../../../../features/admin-onboarding/components/readiness-panel';
import { ScopeHeader } from '../../../../../features/admin-onboarding/components/scope-header';
import { SetupStepper } from '../../../../../features/admin-onboarding/components/setup-stepper';

export default function TenantSetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
      <ScopeHeader />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-6">
          <SetupStepper />

          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">
              Shell placeholder cho flow setup
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">
              Desktop-first layout đã sẵn sàng để story 1.2-1.4 cắm step content,
              review summary và guardrails mà không đổi cấu trúc nền.
            </p>
          </section>
        </section>

        <ReadinessPanel />
      </div>
    </main>
  );
}
