import type { ApiErrorResponse, ApiSuccessResponse, TenantOverviewResult } from '@pos-bluecoral/contracts';

function getInternalApiBaseUrl(): string {
  return process.env['INTERNAL_API_URL'] ?? 'http://localhost:3333';
}

export async function fetchTenantOverview(): Promise<
  ApiSuccessResponse<TenantOverviewResult>
> {
  const url = `${getInternalApiBaseUrl()}/api/tenants`;

  const response = await fetch(url, { cache: 'no-store' });

  const body = (await response.json()) as
    | ApiSuccessResponse<TenantOverviewResult>
    | ApiErrorResponse;

  if (!response.ok || 'error' in body) {
    throw new Error(
      'error' in body
        ? body.error.message
        : `Tenant overview API returned ${response.status}`,
    );
  }

  return body;
}
