'use client';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { ReadinessPanel, type ReadinessItem } from './readiness-panel';
import { ScopeHeader } from './scope-header';
import { SetupStepper, type SetupStep } from './setup-wizard-stepper';

type ProvisioningContextState = {
  branchId?: string;
  branchName?: string;
  requestId?: string;
  tenantId?: string;
  tenantName?: string;
};

type WizardStepId = 'branch' | 'readiness' | 'tenant';

const tenantStepFields: Array<keyof ProvisionTenantRequest> = [
  'tenantName',
  'tenantSlug',
];

const branchStepFields: Array<keyof ProvisionTenantRequest> = [
  'branchName',
  'branchSlug',
  'branchCode',
  'locale',
  'currency',
  'timezone',
];

const wizardStepLabels: Record<WizardStepId, string> = {
  branch: 'Branch đầu tiên',
  readiness: 'Readiness và kiểm tra',
  tenant: 'Tenant cơ bản',
};

const wizardStepTitles: Record<string, WizardStepId> = {
  'Branch đầu tiên': 'branch',
  'Readiness và kiểm tra': 'readiness',
  'Tenant cơ bản': 'tenant',
};

const fieldLabels: Record<keyof ProvisionTenantRequest, string> = {
  actorId: 'actor',
  branchCode: 'mã branch',
  branchName: 'tên branch đầu tiên',
  branchSlug: 'slug branch',
  currency: 'currency',
  locale: 'locale',
  tenantName: 'tên tenant',
  tenantSlug: 'slug tenant',
  timezone: 'timezone',
};

function createReadinessImpact(fieldName: keyof ProvisionTenantRequest) {
  return tenantStepFields.includes(fieldName)
    ? 'Scope chưa thể sẵn sàng.'
    : 'Readiness chưa thể hoàn tất.';
}

function toReadinessDescription(message: string, impact: string) {
  const normalizedMessage = message.trim().replace(/\.$/, '');

  return `${normalizedMessage.charAt(0).toLowerCase()}${normalizedMessage.slice(1)} nên ${impact
    .replace(/\.$/, '')
    .toLowerCase()}.`;
}

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
  const [isReadinessExpanded, setIsReadinessExpanded] = useState(true);
  const [isStepperExpanded, setIsStepperExpanded] = useState(true);
  const [currentStep, setCurrentStep] = useState<WizardStepId>('tenant');
  const [contextState, setContextState] = useState<ProvisioningContextState>({});
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const hasProvisionedContext = Boolean(
    contextState.tenantId && contextState.branchId,
  );

  const validationErrors = useMemo(
    () => validateProvisionTenantForm(formValues),
    [formValues],
  );
  const effectiveFieldErrors = useMemo(() => {
    const mergedErrors: ProvisionTenantFieldErrors = {
      ...validationErrors,
    };

    (Object.entries(fieldErrors) as Array<
      [keyof ProvisionTenantRequest, string | undefined]
    >).forEach(([fieldName, message]) => {
      if (message) {
        mergedErrors[fieldName] = message;
      }
    });

    return mergedErrors;
  }, [fieldErrors, validationErrors]);
  const tenantStepReady = tenantStepFields.every(
    (fieldName) => !effectiveFieldErrors[fieldName],
  );
  const branchStepReady = branchStepFields.every(
    (fieldName) => !effectiveFieldErrors[fieldName],
  );
  const allWizardInputsReady = tenantStepReady && branchStepReady;

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [currentStep]);

  const wizardSteps = useMemo<SetupStep[]>(() => {
    if (hasProvisionedContext) {
      return [
        {
          detail: 'Tenant đầu tiên đã được provision và scope đã được khóa.',
          state: 'completed',
          title: 'Tenant cơ bản',
        },
        {
          detail: 'Context branch đã sẵn sàng sau provisioning.',
          state: 'completed',
          title: 'Branch đầu tiên',
        },
        {
          detail:
            'Readiness đã có đủ scope dữ liệu, nhưng review/publish vẫn ở story kế tiếp.',
          state: 'completed',
          title: 'Readiness và kiểm tra',
        },
      ];
    }

    return [
      {
        detail: 'Thu thập thông tin tenant làm nguồn scope đầu tiên cho onboarding.',
        state: currentStep === 'tenant' ? 'active' : 'completed',
        title: 'Tenant cơ bản',
      },
      {
        blockingReason:
          currentStep === 'tenant'
            ? 'Hoàn tất thông tin tenant để mở khóa bước branch.'
            : undefined,
        detail: tenantStepReady
          ? 'Giữ context branch rõ ràng trước khi tổng hợp readiness.'
          : 'Bước branch chờ tenant basics hợp lệ trước khi tiếp tục.',
        state: currentStep === 'branch' ? 'active' : tenantStepReady ? 'ready' : 'blocked',
        title: 'Branch đầu tiên',
      },
      {
        blockingReason:
          currentStep === 'readiness' || allWizardInputsReady
            ? undefined
            : 'Hoàn tất thông tin tenant và branch trước khi kiểm tra readiness.',
        detail: allWizardInputsReady
          ? 'Checklist readiness đã có thể tổng hợp từ dữ liệu hiện tại.'
          : 'Readiness sẽ chỉ mở khi wizard đã có đủ tenant và branch hợp lệ.',
        state:
          currentStep === 'readiness'
            ? 'active'
            : allWizardInputsReady
              ? 'ready'
              : 'blocked',
        title: 'Readiness và kiểm tra',
      },
    ];
  }, [allWizardInputsReady, currentStep, hasProvisionedContext, tenantStepReady]);

  const currentReadinessLabel = hasProvisionedContext
    ? 'Đã hoàn tất'
    : allWizardInputsReady
      ? 'Sẵn sàng kiểm tra'
      : currentStep === 'tenant'
        ? 'Chưa sẵn sàng'
        : 'Đang hoàn thiện';
  const readinessItems = useMemo<ReadinessItem[]>(() => {
    const tenantPrimaryErrorField = tenantStepFields.find(
      (fieldName) => Boolean(effectiveFieldErrors[fieldName]),
    );
    const branchPrimaryErrorField = branchStepFields.find(
      (fieldName) => Boolean(effectiveFieldErrors[fieldName]),
    );
    const tenantPrimaryError = tenantPrimaryErrorField
      ? effectiveFieldErrors[tenantPrimaryErrorField]
      : undefined;
    const branchPrimaryError = branchPrimaryErrorField
      ? effectiveFieldErrors[branchPrimaryErrorField]
      : undefined;
    const tenantHasServerFieldError = tenantPrimaryErrorField
      ? Boolean(fieldErrors[tenantPrimaryErrorField]) &&
        fieldErrors[tenantPrimaryErrorField] !== validationErrors[tenantPrimaryErrorField]
      : false;
    const branchHasServerFieldError = branchPrimaryErrorField
      ? Boolean(fieldErrors[branchPrimaryErrorField]) &&
        fieldErrors[branchPrimaryErrorField] !== validationErrors[branchPrimaryErrorField]
      : false;

    return [
      {
        actionLabel: 'Mở bước tenant cơ bản',
        description: tenantPrimaryErrorField
          ? tenantHasServerFieldError
            ? toReadinessDescription(
                tenantPrimaryError ?? fieldErrors[tenantPrimaryErrorField] ?? '',
                createReadinessImpact(tenantPrimaryErrorField),
              )
            : `Thiếu ${fieldLabels[tenantPrimaryErrorField]} nên scope chưa thể sẵn sàng.`
          : 'Thông tin tenant đã đủ để khóa context và mở tiếp bước branch.',
        actionDisabled: false,
        onAction: () => setCurrentStep('tenant'),
        state: tenantStepReady ? 'completed' : 'blocked',
        title: 'Thông tin tenant cơ bản',
      },
      {
        actionLabel: 'Mở bước branch đầu tiên',
        description: branchPrimaryErrorField
          ? branchHasServerFieldError
            ? toReadinessDescription(
                branchPrimaryError ?? fieldErrors[branchPrimaryErrorField] ?? '',
                createReadinessImpact(branchPrimaryErrorField),
              )
            : `Thiếu ${fieldLabels[branchPrimaryErrorField]} nên readiness chưa thể hoàn tất.`
          : tenantStepReady
            ? 'Branch mặc định đã có đủ dữ liệu để wizard tiến tới readiness.'
            : 'Hoàn tất tenant trước để bước branch không còn bị chặn.',
        actionDisabled: !tenantStepReady,
        onAction: () => setCurrentStep('branch'),
        state: tenantStepReady && branchStepReady ? 'completed' : tenantStepReady ? 'warning' : 'blocked',
        title: 'Thông tin branch đầu tiên',
      },
      {
        actionLabel: 'Mở bước readiness và kiểm tra',
        description: hasProvisionedContext
          ? 'TenantId, branchId và requestId đã được khóa từ provisioning result.'
          : allWizardInputsReady
            ? 'Dữ liệu đã đủ để lưu và khóa scope từ provisioning result.'
            : 'Scope chỉ được khóa sau khi tenant và branch đều hợp lệ.',
        actionDisabled: !allWizardInputsReady,
        onAction: () => setCurrentStep('readiness'),
        state: hasProvisionedContext ? 'completed' : allWizardInputsReady ? 'ready' : 'blocked',
        title: 'Khóa scope từ provisioning result',
      },
    ];
  }, [allWizardInputsReady, branchStepReady, effectiveFieldErrors, hasProvisionedContext, tenantStepReady]);

  const inlineFieldErrors = useMemo(() => {
    const resolvedInlineErrors: ProvisionTenantFieldErrors = {};

    (Object.entries(effectiveFieldErrors) as Array<
      [keyof ProvisionTenantRequest, string | undefined]
    >).forEach(([fieldName, message]) => {
      if (!message) {
        return;
      }

      resolvedInlineErrors[fieldName] = `${message} ${createReadinessImpact(fieldName)}`;
    });

    return resolvedInlineErrors;
  }, [effectiveFieldErrors]);

  const canOpenStep = (stepId: WizardStepId) => {
    if (stepId === 'tenant') {
      return true;
    }

    if (stepId === 'branch') {
      return tenantStepReady;
    }

    return allWizardInputsReady;
  };

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

  const moveToBranchStep = () => {
    const tenantStepErrors = validateProvisionTenantForm(formValues);
    const nextFieldErrors: ProvisionTenantFieldErrors = {};

    tenantStepFields.forEach((fieldName) => {
      const error = tenantStepErrors[fieldName];
      if (error) {
        nextFieldErrors[fieldName] = error;
      }
    });

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors((current) => ({
        ...current,
        ...nextFieldErrors,
      }));
      return;
    }

    setCurrentStep('branch');
  };

  const handleStepSelect = (stepTitle: string) => {
    const nextStep = wizardStepTitles[stepTitle];
    if (nextStep && canOpenStep(nextStep)) {
      setCurrentStep(nextStep);
    }
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
      setCurrentStep('readiness');
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
        branchName={contextState.branchName ?? (formValues.branchName.trim() || undefined)}
        currentStepLabel={wizardStepLabels[currentStep]}
        readinessLabel={currentReadinessLabel}
        tenantId={contextState.tenantId}
        tenantName={contextState.tenantName ?? (formValues.tenantName.trim() || undefined)}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <button
              aria-controls="tenant-onboarding-stepper"
              aria-expanded={isStepperExpanded}
              className={buttonClassName({ size: 'default', variant: 'secondary' })}
              type="button"
              onClick={() => setIsStepperExpanded((current) => !current)}
            >
              Thu gọn tiến trình onboarding
            </button>
            {isStepperExpanded ? (
              <div id="tenant-onboarding-stepper">
                <SetupStepper steps={wizardSteps} onStepSelect={handleStepSelect} />
              </div>
            ) : null}
          </div>

          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-6 space-y-3">
              <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-semibold text-white">
                {currentStep === 'branch'
                  ? 'Cấu hình branch đầu tiên'
                  : currentStep === 'readiness'
                    ? 'Kiểm tra readiness trước khi lưu'
                    : 'Provision tenant va branch dau tien'}
              </h2>
              <p className="max-w-3xl text-sm text-slate-300">
                {currentStep === 'branch'
                  ? 'Bước này giữ branch context rõ ràng trước khi wizard tổng hợp readiness.'
                  : currentStep === 'readiness'
                    ? 'Readiness tóm tắt các điều kiện còn thiếu trước khi gửi provisioning.'
                    : 'Form này giữ source of truth cho tenant/branch context để Story 1.3 tiếp tục mở rộng wizard, readiness và review mà không mất scope.'}
              </p>
              {formError ? (
                <p className="text-sm text-rose-300">{formError}</p>
              ) : null}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  error={inlineFieldErrors.tenantName}
                  label="Tên tenant"
                  name="tenantName"
                  onChange={handleChange}
                  value={formValues.tenantName}
                />
                <Field
                  error={inlineFieldErrors.tenantSlug}
                  label="Slug tenant"
                  name="tenantSlug"
                  onChange={handleChange}
                  value={formValues.tenantSlug}
                />
                <Field
                  error={inlineFieldErrors.branchName}
                  label="Tên branch đầu tiên"
                  name="branchName"
                  onChange={handleChange}
                  value={formValues.branchName}
                />
                <Field
                  error={inlineFieldErrors.branchSlug}
                  label="Slug branch"
                  name="branchSlug"
                  onChange={handleChange}
                  value={formValues.branchSlug}
                />
                <Field
                  error={inlineFieldErrors.branchCode}
                  label="Mã branch"
                  name="branchCode"
                  onChange={handleChange}
                  value={formValues.branchCode}
                />
                <Field
                  error={inlineFieldErrors.locale}
                  label="Locale"
                  name="locale"
                  onChange={handleChange}
                  value={formValues.locale}
                />
                <Field
                  error={inlineFieldErrors.currency}
                  label="Currency"
                  name="currency"
                  onChange={handleChange}
                  value={formValues.currency}
                />
                <Field
                  error={inlineFieldErrors.timezone}
                  label="Timezone"
                  name="timezone"
                  onChange={handleChange}
                  value={formValues.timezone}
                />
              </div>

              <div className="flex items-center gap-4">
                {currentStep === 'tenant' ? (
                  <button
                    className={buttonClassName({ size: 'lg', variant: 'secondary' })}
                    type="button"
                    onClick={moveToBranchStep}
                  >
                    Tiếp tục tới bước branch
                  </button>
                ) : null}
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

        <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <button
            aria-controls="tenant-onboarding-readiness"
            aria-expanded={isReadinessExpanded}
            className={buttonClassName({ size: 'default', variant: 'secondary' })}
            type="button"
            onClick={() => setIsReadinessExpanded((current) => !current)}
          >
            Thu gọn readiness panel
          </button>
          {isReadinessExpanded ? (
            <div id="tenant-onboarding-readiness">
              <ReadinessPanel
                items={readinessItems}
              />
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
