import { ApiProperty } from '@nestjs/swagger';
import { ProvisionTenantRequest } from '@pos-bluecoral/contracts';

export interface ValidationIssue {
  field: keyof ProvisionTenantRequest;
  message: string;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const branchCodePattern = /^[A-Z0-9-]{2,12}$/;

export class ProvisionTenantRequestDto implements ProvisionTenantRequest {
  @ApiProperty()
  actorId!: string;

  @ApiProperty()
  tenantName!: string;

  @ApiProperty()
  tenantSlug!: string;

  @ApiProperty()
  branchName!: string;

  @ApiProperty()
  branchSlug!: string;

  @ApiProperty()
  branchCode!: string;

  @ApiProperty()
  locale!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  timezone!: string;
}

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeProvisionTenantRequest(
  payload: ProvisionTenantRequest,
): ProvisionTenantRequest {
  return {
    actorId: asTrimmedString(payload.actorId),
    branchCode: asTrimmedString(payload.branchCode).toUpperCase(),
    branchName: asTrimmedString(payload.branchName),
    branchSlug: asTrimmedString(payload.branchSlug),
    currency: asTrimmedString(payload.currency),
    locale: asTrimmedString(payload.locale),
    tenantName: asTrimmedString(payload.tenantName),
    tenantSlug: asTrimmedString(payload.tenantSlug),
    timezone: asTrimmedString(payload.timezone),
  };
}

export function validateProvisionTenantRequest(
  payload: ProvisionTenantRequest,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!payload.actorId.trim()) {
    issues.push({ field: 'actorId', message: 'actorId là bắt buộc.' });
  }

  if (!payload.tenantName.trim()) {
    issues.push({ field: 'tenantName', message: 'tenantName là bắt buộc.' });
  }

  if (!slugPattern.test(payload.tenantSlug.trim())) {
    issues.push({
      field: 'tenantSlug',
      message: 'tenantSlug phải ở dạng kebab-case.',
    });
  }

  if (!payload.branchName.trim()) {
    issues.push({ field: 'branchName', message: 'branchName là bắt buộc.' });
  }

  if (!slugPattern.test(payload.branchSlug.trim())) {
    issues.push({
      field: 'branchSlug',
      message: 'branchSlug phải ở dạng kebab-case.',
    });
  }

  if (!branchCodePattern.test(payload.branchCode.trim().toUpperCase())) {
    issues.push({
      field: 'branchCode',
      message: 'branchCode phải gồm 2-12 ký tự A-Z, 0-9 hoặc dấu gạch ngang.',
    });
  }

  if (!payload.locale.trim()) {
    issues.push({ field: 'locale', message: 'locale là bắt buộc.' });
  }

  if (!payload.currency.trim()) {
    issues.push({ field: 'currency', message: 'currency là bắt buộc.' });
  }

  if (!payload.timezone.trim()) {
    issues.push({ field: 'timezone', message: 'timezone là bắt buộc.' });
  }

  return issues;
}
