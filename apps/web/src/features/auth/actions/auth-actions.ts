'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import type { LoginRequest } from '@pos-bluecoral/contracts';
import { apiLogin, apiLogout } from '../api/auth';

const REFRESH_COOKIE = 'refresh_token';
const SESSION_COOKIE = 'session_id';
const ACCESS_TOKEN_COOKIE = 'access_token';

export interface LoginActionResult {
  ok: boolean;
  error?: { code: string; message: string };
  data?: {
    accessToken: string;
    expiresIn: number;
    staffId: string;
    tenantId: string;
    branchId: string;
    role: string;
    sessionId: string;
  };
}

export async function loginAction(payload: LoginRequest): Promise<LoginActionResult> {
  const requestId = randomUUID();

  try {
    const result = await apiLogin(payload, requestId);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, result.sessionId, {
      httpOnly: false,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    cookieStore.set(ACCESS_TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: result.expiresIn,
    });

    // Propagate the refresh_token cookie from the API response to the browser
    for (const setCookie of result.setCookieHeaders) {
      if (setCookie.startsWith('refresh_token=')) {
        const value = setCookie.split(';')[0]?.replace('refresh_token=', '') ?? '';
        cookieStore.set(REFRESH_COOKIE, value, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          path: '/api/auth',
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return {
      ok: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        staffId: result.staffId,
        tenantId: result.tenantId,
        branchId: result.branchId,
        role: result.role,
        sessionId: result.sessionId,
      },
    };
  } catch (err) {
    const error = err as Error & { code?: string };
    return {
      ok: false,
      error: {
        code: error.code ?? 'unexpected-error',
        message: error.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.',
      },
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value ?? '';
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? '';
  const requestId = randomUUID();

  try {
    if (sessionId) {
      await apiLogout(sessionId, accessToken, requestId);
    }
  } finally {
    cookieStore.delete(REFRESH_COOKIE);
    cookieStore.delete(SESSION_COOKIE);
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    redirect('/sign-in');
  }
}
