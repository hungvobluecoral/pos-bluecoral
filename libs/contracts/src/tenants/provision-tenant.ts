export interface ProvisionTenantRequest {
  actorId: string;
  tenantName: string;
  tenantSlug: string;
  branchName: string;
  branchSlug: string;
  branchCode: string;
  locale: string;
  currency: string;
  timezone: string;
}

export interface ProvisionedTenantSummary {
  name: string;
  slug: string;
}

export interface ProvisionedBranchSummary {
  name: string;
  slug: string;
  code: string;
}

export interface ProvisionTenantResult {
  tenantId: string;
  branchId: string;
  tenant: ProvisionedTenantSummary;
  branch: ProvisionedBranchSummary;
}

/**
 * Standardized error codes for the provisioning flow.
 * UI-side codes (readiness-blocked, guardrail-violation) are intercepted
 * before reaching the API. API-side codes are returned in the error envelope.
 */
export type ProvisionTenantErrorCode =
  | 'branch-already-exists'
  | 'conflict'
  | 'guardrail-violation'
  | 'invalid-error-envelope'
  | 'invalid-success-envelope'
  | 'readiness-blocked'
  | 'scope-mismatch'
  | 'tenant-already-exists'
  | 'unexpected-error'
  | 'validation-failed';
