'use client';

import { useRouter } from 'next/navigation';
import { SignInForm } from '../../features/auth/components/sign-in-form';
import { setSession } from '../../lib/auth/session';
import type { StaffRole } from '@pos-bluecoral/contracts';

export default function SignInPage() {
  const router = useRouter();

  function handleLoginSuccess(data: {
    accessToken: string;
    expiresIn: number;
    staffId: string;
    tenantId: string;
    branchId: string;
    role: string;
    sessionId: string;
  }) {
    setSession({
      accessToken: data.accessToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
      staffId: data.staffId,
      tenantId: data.tenantId,
      branchId: data.branchId,
      role: data.role as StaffRole,
      sessionId: data.sessionId,
    });

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-slate-50">POS BlueCoral</h1>
          <p className="text-sm text-slate-400">Đăng nhập vào workspace của bạn</p>
        </div>

        <SignInForm onSuccess={handleLoginSuccess} />
      </div>
    </main>
  );
}
