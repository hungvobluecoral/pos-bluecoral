export const TENANT_READINESS_STATUSES = [
  'active',
  'completed',
  'warning',
  'blocked',
  'ready',
] as const;

export type TenantReadinessStatus = (typeof TENANT_READINESS_STATUSES)[number];

export interface TenantOverviewBranchSummary {
  branchId: string;
  name: string;
  slug: string;
  code: string;
  readinessStatus: TenantReadinessStatus;
}

export interface TenantOverviewItem {
  tenantId: string;
  name: string;
  slug: string;
  createdAt: string;
  defaultBranch: TenantOverviewBranchSummary | null;
}

export interface TenantOverviewResult {
  totalTenants: number;
  items: TenantOverviewItem[];
}
