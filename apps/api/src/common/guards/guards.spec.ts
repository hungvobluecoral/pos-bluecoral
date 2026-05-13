import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AccessTokenClaims } from '@pos-bluecoral/contracts';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ScopeGuard } from './scope.guard';
import { RolesGuard } from './roles.guard';
import { AuthService } from '../../modules/auth/auth.service';
import { SCOPE_TYPES_KEY, ALLOW_SUPER_ADMIN_KEY } from '../decorators/require-scope.decorator';
import { ROLES_KEY } from '../decorators/require-roles.decorator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCtxWithUser(user?: AccessTokenClaims | null): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

const branchScopeClaims: AccessTokenClaims = {
  type: 'branch_scope',
  sub: 'user-001',
  userId: 'user-001',
  tenantId: 'tenant-001',
  branchId: 'branch-001',
  role: 'cashier',
  sessionId: 'session-001',
};

const tenantScopeClaims: AccessTokenClaims = {
  type: 'tenant_scope',
  sub: 'user-001',
  userId: 'user-001',
  tenantId: 'tenant-001',
  role: 'owner',
  sessionId: 'session-001',
};

const superAdminClaims: AccessTokenClaims = {
  type: 'super_admin',
  sub: 'sa-001',
  userId: 'sa-001',
  sessionId: 'session-sa',
};

const pendingClaims = {
  type: 'branch_select_pending',
  sub: 'user-001',
  userId: 'user-001',
  tenantId: 'tenant-001',
  sessionId: 'session-pending',
  branches: [],
};

// ─── JwtAuthGuard ─────────────────────────────────────────────────────────────

describe('JwtAuthGuard', () => {
  const authService = { verifyAccessToken: jest.fn() } as unknown as AuthService;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    jest.resetAllMocks();
    guard = new JwtAuthGuard(authService);
  });

  it('populates request.user and returns true for valid Bearer token', () => {
    (authService.verifyAccessToken as jest.Mock).mockReturnValue(branchScopeClaims);
    const req: Record<string, unknown> = { headers: { authorization: 'Bearer valid.token' } };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
    expect(req['user']).toEqual(branchScopeClaims);
  });

  it('throws missing-token when no Authorization header', () => {
    const ctx = { switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws missing-token when Authorization is not Bearer', () => {
    const ctx = { switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Basic abc' } }) }) } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('propagates UnauthorizedException from verifyAccessToken', () => {
    (authService.verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedException({ code: 'invalid-token', message: 'bad' });
    });
    const ctx = { switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Bearer expired.token' } }) }) } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

// ─── ScopeGuard (Layer 2: JWT type gate) ─────────────────────────────────────

describe('ScopeGuard', () => {
  let reflector: Reflector;
  let guard: ScopeGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ScopeGuard(reflector);
  });

  function withMeta(user: AccessTokenClaims | typeof pendingClaims | null, scopeTypes?: string[], allowSA = false) {
    const ctx = makeCtxWithUser(user as AccessTokenClaims);
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === SCOPE_TYPES_KEY) return scopeTypes ?? null;
      if (key === ALLOW_SUPER_ADMIN_KEY) return allowSA || null;
      return null;
    });
    return ctx;
  }

  it('always blocks branch_select_pending JWT', () => {
    const ctx = withMeta(pendingClaims as unknown as AccessTokenClaims);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('blocks super_admin from business routes (no @AllowSuperAdmin)', () => {
    const ctx = withMeta(superAdminClaims);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows super_admin when @AllowSuperAdmin() is present', () => {
    const ctx = withMeta(superAdminClaims, undefined, true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows branch_scope when @RequireJwtTypes("branch_scope") is set', () => {
    const ctx = withMeta(branchScopeClaims, ['branch_scope']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows tenant_scope when @RequireJwtTypes("tenant_scope") is set', () => {
    const ctx = withMeta(tenantScopeClaims, ['tenant_scope']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows branch_scope or tenant_scope when both are required', () => {
    const ctxB = withMeta(branchScopeClaims, ['tenant_scope', 'branch_scope']);
    const ctxT = withMeta(tenantScopeClaims, ['tenant_scope', 'branch_scope']);
    expect(guard.canActivate(ctxB)).toBe(true);
    expect(guard.canActivate(ctxT)).toBe(true);
  });

  it('blocks tenant_scope when only branch_scope is required', () => {
    const ctx = withMeta(tenantScopeClaims, ['branch_scope']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('passes all non-SA types when no @RequireJwtTypes is set', () => {
    const ctx = withMeta(branchScopeClaims);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws UnauthorizedException when user is null (JwtAuthGuard skipped)', () => {
    const ctx = makeCtxWithUser(null);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});

// ─── RolesGuard (Layer 3: role hierarchy) ────────────────────────────────────

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function withRole(roleInJwt: string, requiredRoles: string[] | null) {
    const user = { ...branchScopeClaims, role: roleInJwt } as unknown as AccessTokenClaims;
    const ctx = makeCtxWithUser(user);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    return ctx;
  }

  it('passes when no roles required', () => {
    const ctx = withRole('viewer', null);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('owner satisfies manager-gated route (hierarchy)', () => {
    expect(guard.canActivate(withRole('owner', ['manager']))).toBe(true);
  });

  it('manager satisfies cashier-gated route (hierarchy)', () => {
    expect(guard.canActivate(withRole('manager', ['cashier']))).toBe(true);
  });

  it('cashier satisfies cashier-gated route', () => {
    expect(guard.canActivate(withRole('cashier', ['cashier']))).toBe(true);
  });

  it('denies viewer from cashier-gated route', () => {
    expect(() => guard.canActivate(withRole('viewer', ['cashier']))).toThrow(ForbiddenException);
  });

  it('denies cashier from manager-only route', () => {
    expect(() => guard.canActivate(withRole('cashier', ['manager']))).toThrow(ForbiddenException);
  });

  it('denies manager from owner-only route', () => {
    expect(() => guard.canActivate(withRole('manager', ['owner']))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is absent', () => {
    const ctx = makeCtxWithUser(null);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['cashier']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('denies super_admin (no role in JWT) even if roles required', () => {
    const ctx = makeCtxWithUser(superAdminClaims);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['viewer']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
