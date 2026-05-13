'use client';

import type {
  ApiErrorBody,
  ApiErrorResponse,
  ApiSuccessResponse,
  ProvisionTenantRequest,
  ProvisionTenantResult,
} from '@pos-bluecoral/contracts';

export class ProvisionTenantApiError extends Error {
  constructor(public readonly payload: ApiErrorBody) {
    super(payload.message);
  }
}

function isApiErrorResponse(
  payload: ApiErrorResponse | ApiSuccessResponse<ProvisionTenantResult>,
): payload is ApiErrorResponse {
  return 'error' in payload;
}

export async function provisionTenant(
  payload: ProvisionTenantRequest,
): Promise<ApiSuccessResponse<ProvisionTenantResult>> {
  const response = await fetch('/api/tenants/provisioning', {
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  const body = (await response.json()) as
    | ApiSuccessResponse<ProvisionTenantResult>
    | ApiErrorResponse;

  if (!response.ok) {
    if (!isApiErrorResponse(body)) {
      throw new ProvisionTenantApiError({
        code: 'invalid-error-envelope',
        message: 'Phan hoi loi tu provisioning API khong dung dinh dang.',
      });
    }

    throw new ProvisionTenantApiError(body.error);
  }

  if (isApiErrorResponse(body)) {
    throw new ProvisionTenantApiError({
      code: 'invalid-success-envelope',
      message: 'Phan hoi thanh cong tu provisioning API khong dung dinh dang.',
    });
  }

  return body;
}
