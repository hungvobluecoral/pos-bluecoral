import type { StaffRole } from '@pos-bluecoral/contracts';

export interface SessionData {
  accessToken: string;
  expiresAt: number; // Unix timestamp ms
  staffId: string;
  tenantId: string;
  branchId: string;
  role: StaffRole;
  sessionId: string;
}

const SESSION_KEY = 'pos_session';

/**
 * In-memory session store — single source of truth for workspace access.
 * Scoped to the browser tab; no localStorage to avoid long-lived token exposure.
 */
let _session: SessionData | null = null;

export function setSession(data: SessionData): void {
  _session = data;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }
}

export function getSession(): SessionData | null {
  if (_session) return _session;
  if (typeof sessionStorage !== 'undefined') {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        _session = JSON.parse(raw) as SessionData;
      } catch {
        _session = null;
      }
    }
  }
  return _session;
}

export function clearSession(): void {
  _session = null;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function isSessionValid(): boolean {
  const session = getSession();
  if (!session) return false;
  return session.expiresAt > Date.now() + 30_000; // 30s buffer
}
