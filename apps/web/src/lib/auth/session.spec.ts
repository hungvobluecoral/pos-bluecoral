import { clearSession, getSession, isSessionValid, setSession } from './session';
import type { SessionData } from './session';

const baseSession: SessionData = {
  accessToken: 'tok',
  expiresAt: Date.now() + 900_000,
  staffId: 'staff-001',
  tenantId: 'tenant-001',
  branchId: 'branch-001',
  role: 'cashier',
  sessionId: 'session-001',
};

describe('session store', () => {
  beforeEach(() => {
    clearSession();
  });

  it('setSession and getSession round-trip', () => {
    setSession(baseSession);
    expect(getSession()).toEqual(baseSession);
  });

  it('clearSession removes stored session', () => {
    setSession(baseSession);
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('isSessionValid returns true for non-expired session', () => {
    setSession(baseSession);
    expect(isSessionValid()).toBe(true);
  });

  it('isSessionValid returns false for expired session', () => {
    setSession({ ...baseSession, expiresAt: Date.now() - 1_000 });
    expect(isSessionValid()).toBe(false);
  });

  it('isSessionValid returns false when no session', () => {
    expect(isSessionValid()).toBe(false);
  });

  it('isSessionValid returns false when session expires within 30s buffer', () => {
    setSession({ ...baseSession, expiresAt: Date.now() + 20_000 });
    expect(isSessionValid()).toBe(false);
  });
});
