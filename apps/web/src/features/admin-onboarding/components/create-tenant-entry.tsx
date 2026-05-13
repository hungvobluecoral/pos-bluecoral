import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { buttonClassName } from '../../../components/ui/button';

export function CreateTenantEntry() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
            <Building2 className="size-4" aria-hidden="true" />
            System admin workspace
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Bảng điều khiển khởi tạo tenant
            </h2>
            <p className="text-base text-slate-300">
              Bắt đầu onboarding tenant và branch đầu tiên trong một flow có
              stepper, scope header và readiness panel rõ ràng ngay từ foundation.
            </p>
          </div>
        </div>

        <Link
          href="/setup/tenants/new"
          className={buttonClassName({ size: 'lg' })}
        >
          Tạo tenant mới
          <ArrowRight className="ml-2 size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
