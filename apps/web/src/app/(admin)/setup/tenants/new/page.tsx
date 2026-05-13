import { TenantProvisioningShell } from '../../../../../features/admin-onboarding/components/tenant-provisioning-shell';

export default function TenantSetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
      <TenantProvisioningShell />
    </main>
  );
}
