'use client';

import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import type { ApiErrorBody, ProvisionTenantRequest } from '@pos-bluecoral/contracts';
import { buttonClassName } from '../../../components/ui/button';
import {
  ProvisionTenantApiError,
  provisionTenant,
} from '../api/provision-tenant';
import {
  initialProvisionTenantFormValues,
  type ProvisionTenantFieldErrors,
  validateProvisionTenantForm,
} from '../schemas/provision-tenant-form';
import { ReadinessPanel } from './readiness-panel';
import { ScopeHeader } from './scope-header';
import { SetupStepper } from './setup-stepper';

type ProvisioningContextState = {
  branchId?: string;
  branchName?: string;
  requestId?: string;
  tenantId?: string;
  tenantName?: string;
};

function Field({
  error,
  label,
  name,
  onChange,
  value,
}: {
  error?: string;
  label: string;
  name: keyof ProvisionTenantRequest;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) {
  const errorId = `${name}-error`;

  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-100">{label}</span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-cyan-300"
        name={name}
        onChange={onChange}
        value={value}
      />
      {error ? (
        <span id={errorId} className="text-sm text-rose-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function mapApiErrors(error: ApiErrorBody): ProvisionTenantFieldErrors {
  if (!Array.isArray(error.details)) {
    return {};
  }

  return error.details.reduce<ProvisionTenantFieldErrors>((acc, detail) => {
    if (
      typeof detail === 'object' &&
      detail !== null &&
      'field' in detail &&
      'message' in detail &&
      typeof detail.field === 'string' &&
      typeof detail.message === 'string'
    ) {
      acc[detail.field as keyof ProvisionTenantRequest] = detail.message;
    }

    return acc;
  }, {});
}

export function TenantProvisioningShell() {
  const [formValues, setFormValues] = useState(initialProvisionTenantFormValues);
  const [fieldErrors, setFieldErrors] = useState<ProvisionTenantFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextState, setContextState] = useState<ProvisioningContextState>({});

  const hasProvisionedContext = Boolean(
    contextState.tenantId && contextState.branchId,
  );

  const readinessItems = useMemo(
    () => ({
      contractReady: hasProvisionedContext,
      scopeReady: hasProvisionedContext,
    }),
    [hasProvisionedContext],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateProvisionTenantForm(formValues);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await provisionTenant({
        ...formValues,
        branchCode: formValues.branchCode.toUpperCase(),
      });

      setContextState({
        branchId: response.data.branchId,
        branchName: response.data.branch.name,
        requestId: response.meta?.requestId,
        tenantId: response.data.tenantId,
        tenantName: response.data.tenant.name,
      });
      setFieldErrors({});
    } catch (error) {
      if (error instanceof ProvisionTenantApiError) {
        const apiFieldErrors = mapApiErrors(error.payload);
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors(apiFieldErrors);
        }

        setFormError(error.payload.message);
      } else {
        setFormError('Không thể lưu tenant/branch ở thời điểm này.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScopeHeader
        branchId={contextState.branchId}
        branchName={contextState.branchName}
        tenantId={contextState.tenantId}
        tenantName={contextState.tenantName}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-6">
          <SetupStepper hasProvisionedContext={hasProvisionedContext} />

          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-6 space-y-3">
              <h2 className="text-xl font-semibold text-white">
                Provision tenant va branch dau tien
              </h2>
              <p className="max-w-3xl text-sm text-slate-300">
                Form nay giu source of truth cho tenant/branch context de Story
                1.3 tiep tuc mo rong wizard, readiness va review ma khong mat
                scope.
              </p>
              {formError ? (
                <p className="text-sm text-rose-300">{formError}</p>
              ) : null}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  error={fieldErrors.tenantName}
                  label="Tên tenant"
                  name="tenantName"
                  onChange={handleChange}
                  value={formValues.tenantName}
                />
                <Field
                  error={fieldErrors.tenantSlug}
                  label="Slug tenant"
                  name="tenantSlug"
                  onChange={handleChange}
                  value={formValues.tenantSlug}
                />
                <Field
                  error={fieldErrors.branchName}
                  label="Tên branch đầu tiên"
                  name="branchName"
                  onChange={handleChange}
                  value={formValues.branchName}
                />
                <Field
                  error={fieldErrors.branchSlug}
                  label="Slug branch"
                  name="branchSlug"
                  onChange={handleChange}
                  value={formValues.branchSlug}
                />
                <Field
                  error={fieldErrors.branchCode}
                  label="Mã branch"
                  name="branchCode"
                  onChange={handleChange}
                  value={formValues.branchCode}
                />
                <Field
                  error={fieldErrors.locale}
                  label="Locale"
                  name="locale"
                  onChange={handleChange}
                  value={formValues.locale}
                />
                <Field
                  error={fieldErrors.currency}
                  label="Currency"
                  name="currency"
                  onChange={handleChange}
                  value={formValues.currency}
                />
                <Field
                  error={fieldErrors.timezone}
                  label="Timezone"
                  name="timezone"
                  onChange={handleChange}
                  value={formValues.timezone}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  className={buttonClassName({ size: 'lg' })}
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu tenant và branch'}
                </button>
                {contextState.requestId ? (
                  <span className="text-sm text-slate-400">
                    RequestId: {contextState.requestId}
                  </span>
                ) : null}
              </div>
            </form>
          </section>
        </section>

        <ReadinessPanel
          hasProvisionedContext={hasProvisionedContext}
          readinessItems={readinessItems}
        />
      </div>
    </>
  );
}
