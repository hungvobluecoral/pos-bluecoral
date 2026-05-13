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
