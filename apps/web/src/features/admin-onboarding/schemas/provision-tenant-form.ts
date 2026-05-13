import type { ProvisionTenantRequest } from '@pos-bluecoral/contracts';

export type ProvisionTenantFieldErrors = Partial<
  Record<keyof ProvisionTenantRequest, string>
>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const branchCodePattern = /^[A-Z0-9-]{2,12}$/;

export const initialProvisionTenantFormValues: ProvisionTenantRequest = {
  actorId: 'system-admin',
  branchCode: '',
  branchName: '',
  branchSlug: '',
  currency: 'VND',
  locale: 'vi-VN',
  tenantName: '',
  tenantSlug: '',
  timezone: 'Asia/Ho_Chi_Minh',
};

export function validateProvisionTenantForm(
  values: ProvisionTenantRequest,
): ProvisionTenantFieldErrors {
  const errors: ProvisionTenantFieldErrors = {};

  if (!values.tenantName.trim()) {
    errors.tenantName = 'Tên tenant là bắt buộc.';
  }

  if (!values.tenantSlug.trim()) {
    errors.tenantSlug = 'Slug tenant là bắt buộc.';
  } else if (!slugPattern.test(values.tenantSlug.trim())) {
    errors.tenantSlug = 'Slug tenant phải ở dạng kebab-case.';
  }

  if (!values.branchName.trim()) {
    errors.branchName = 'Tên branch đầu tiên là bắt buộc.';
  }

  if (!values.branchSlug.trim()) {
    errors.branchSlug = 'Slug branch là bắt buộc.';
  } else if (!slugPattern.test(values.branchSlug.trim())) {
    errors.branchSlug = 'Slug branch phải ở dạng kebab-case.';
  }

  if (!values.branchCode.trim()) {
    errors.branchCode = 'Mã branch là bắt buộc.';
  } else if (!branchCodePattern.test(values.branchCode.trim().toUpperCase())) {
    errors.branchCode = 'Mã branch phải gồm 2-12 ký tự A-Z, 0-9 hoặc dấu gạch ngang.';
  }

  if (!values.locale.trim()) {
    errors.locale = 'Locale là bắt buộc.';
  }

  if (!values.currency.trim()) {
    errors.currency = 'Currency là bắt buộc.';
  }

  if (!values.timezone.trim()) {
    errors.timezone = 'Timezone là bắt buộc.';
  }

  return errors;
}
