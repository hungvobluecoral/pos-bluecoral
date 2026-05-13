import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '@pos-bluecoral/contracts';

function getApiBaseUrl(): string {
  return process.env['INTERNAL_API_URL'] ?? 'http://localhost:3333';
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  staffId: string;
  tenantId: string;
  branchId: string;
  role: string;
  sessionId: string;
  setCookieHeaders: string[];
}

export async function apiLogin(
  payload: LoginRequest,
  requestId: string,
): Promise<LoginResult> {
  const url = `${getApiBaseUrl()}/api/auth/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = (await response.json()) as
    | ApiSuccessResponse<LoginResponse>
    | ApiErrorResponse;

  if (!response.ok || 'error' in body) {
    const code = 'error' in body ? body.error.code : 'unexpected-error';
    const message = 'error' in body ? body.error.message : `Auth API returned ${response.status}`;
    throw Object.assign(new Error(message), { code });
  }

  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];

  return {
    ...body.data,
    setCookieHeaders,
  };
}

export async function apiRefresh(
  refreshCookie: string,
  sessionCookie: string,
  requestId: string,
): Promise<{ data: RefreshResponse; setCookieHeaders: string[] }> {
  const url = `${getApiBaseUrl()}/api/auth/refresh`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
      Cookie: `refresh_token=${refreshCookie}; session_id=${sessionCookie}`,
    },
    cache: 'no-store',
  });

  const body = (await response.json()) as
    | ApiSuccessResponse<RefreshResponse>
    | ApiErrorResponse;

  if (!response.ok || 'error' in body) {
    const code = 'error' in body ? body.error.code : 'unexpected-error';
    const message = 'error' in body ? body.error.message : `Refresh API returned ${response.status}`;
    throw Object.assign(new Error(message), { code });
  }

  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
  return { data: body.data, setCookieHeaders };
}

export async function apiLogout(
  sessionCookie: string,
  accessToken: string,
  requestId: string,
): Promise<void> {
  const url = `${getApiBaseUrl()}/api/auth/logout`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-request-id': requestId,
      Cookie: `session_id=${sessionCookie}`,
    },
    cache: 'no-store',
  });
}
