import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { AuthService } from './auth.service';
import { InviteTokenRepository } from './repositories/invite-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';

const mockUser = {
  id: 'user-001',
  email: 'cashier@shop.com',
  passwordHash: '$2a$12$placeholder',
  isSuperAdmin: false,
  isActive: true,
};

const mockBranchMembership = {
  tenantId: 'tenant-001',
  branchId: 'branch-001',
  branchName: 'Main Branch',
  role: 'cashier',
};

const mockScopeSnapshot = {
  type: 'branch_scope' as const,
  tenantId: 'tenant-001',
  branchId: 'branch-001',
  role: 'cashier' as const,
};

describe('AuthService', () => {
  const userRepository = {
    findByEmailWithMemberships: jest.fn(),
    findById: jest.fn(),
    findByIdWithTenantMembership: jest.fn(),
    findBranchMembership: jest.fn(),
    branchBelongsToTenant: jest.fn(),
    activateWithPassword: jest.fn(),
  } as unknown as UserRepository;

  const refreshTokenRepository = {
    create: jest.fn(),
    findActiveBySessionId: jest.fn(),
    findBySessionId: jest.fn(),
    revokeBySessionId: jest.fn(),
    revokeAllForUser: jest.fn(),
    revokeById: jest.fn(),
  } as unknown as RefreshTokenRepository;

  const jwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  } as unknown as JwtService;

  const auditService = {
    recordAuthEvent: jest.fn(),
  } as unknown as AuditService;

  const inviteTokenRepository = {
    findValidByHash: jest.fn(),
    findExpiredOrUsedByHash: jest.fn(),
    markUsed: jest.fn(),
    create: jest.fn(),
  } as unknown as InviteTokenRepository;

  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AuthService(userRepository, refreshTokenRepository, jwtService, auditService, inviteTokenRepository);
    (jwtService.sign as jest.Mock).mockReturnValue('mock.access.token');
  });

  const ctx = { requestId: 'req-001', userAgent: 'test-agent', ipAddress: '127.0.0.1' };

  // ─── Login — single branch user (branch_scope) ─────────────────────────────

  it('login: issues branch_scope JWT for user with one BranchMembership', async () => {
    const bcryptjs = await import('bcryptjs');
    const hash = bcryptjs.hashSync('password123', 4);
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue({
      ...mockUser,
      passwordHash: hash,
      tenantMembership: null,
      branchMemberships: [mockBranchMembership],
    });
    (refreshTokenRepository.create as jest.Mock).mockResolvedValue({});

    const result = await service.login({ email: mockUser.email, password: 'password123' }, ctx);

    expect(result.response.outcome).toBe('authenticated');
    expect(result.rawRefreshToken).toBeTruthy();
    expect(auditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.login', outcome: 'success' }),
    );
  });

  // ─── Login — Owner (tenant_scope) ─────────────────────────────────────────

  it('login: issues tenant_scope JWT for Owner', async () => {
    const bcryptjs = await import('bcryptjs');
    const hash = bcryptjs.hashSync('pass', 4);
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue({
      ...mockUser,
      passwordHash: hash,
      isSuperAdmin: false,
      tenantMembership: { tenantId: 'tenant-001', role: 'owner' },
      branchMemberships: [],
    });
    (refreshTokenRepository.create as jest.Mock).mockResolvedValue({});

    const result = await service.login({ email: mockUser.email, password: 'pass' }, ctx);

    expect(result.response.outcome).toBe('authenticated');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tenant_scope', tenantId: 'tenant-001' }),
      expect.any(Object),
    );
  });

  // ─── Login — Super Admin ────────────────────────────────────────────────────

  it('login: issues super_admin JWT for Super Admin', async () => {
    const bcryptjs = await import('bcryptjs');
    const hash = bcryptjs.hashSync('adminpass', 4);
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue({
      ...mockUser,
      passwordHash: hash,
      isSuperAdmin: true,
      tenantMembership: null,
      branchMemberships: [],
    });
    (refreshTokenRepository.create as jest.Mock).mockResolvedValue({});

    const result = await service.login({ email: mockUser.email, password: 'adminpass' }, ctx);

    expect(result.response.outcome).toBe('authenticated');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'super_admin' }),
      expect.any(Object),
    );
  });

  // ─── Login — multi-branch (branch_select_required) ────────────────────────

  it('login: returns branch_select_required for multi-branch user', async () => {
    const bcryptjs = await import('bcryptjs');
    const hash = bcryptjs.hashSync('pass', 4);
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue({
      ...mockUser,
      passwordHash: hash,
      tenantMembership: null,
      branchMemberships: [
        { ...mockBranchMembership, branchId: 'branch-001', branchName: 'Main' },
        { ...mockBranchMembership, branchId: 'branch-002', branchName: 'Second' },
      ],
    });

    const result = await service.login({ email: mockUser.email, password: 'pass' }, ctx);

    expect(result.response.outcome).toBe('branch_select_required');
    expect(result.rawRefreshToken).toBeUndefined();
  });

  // ─── Login denied paths ────────────────────────────────────────────────────

  it('login: throws invalid-credentials when user not found', async () => {
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue(null);

    await expect(service.login({ email: 'ghost@shop.com', password: 'any' }, ctx)).rejects.toThrow(UnauthorizedException);
    expect(auditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'failure' }),
    );
  });

  it('login: throws account-inactive for inactive user', async () => {
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue({
      ...mockUser, isActive: false, tenantMembership: null, branchMemberships: [],
    });

    await expect(service.login({ email: mockUser.email, password: 'any' }, ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('login: throws invalid-credentials on wrong password', async () => {
    const bcryptjs = await import('bcryptjs');
    const hash = bcryptjs.hashSync('correct-pass', 4);
    (userRepository.findByEmailWithMemberships as jest.Mock).mockResolvedValue({
      ...mockUser, passwordHash: hash, tenantMembership: null, branchMemberships: [mockBranchMembership],
    });

    await expect(service.login({ email: mockUser.email, password: 'wrong-pass' }, ctx)).rejects.toThrow(UnauthorizedException);
  });

  // ─── Enter branch ──────────────────────────────────────────────────────────

  it('enterBranch: issues branch_scope token when branch belongs to tenant', async () => {
    (userRepository.branchBelongsToTenant as jest.Mock).mockResolvedValue(true);

    const ownerClaims = {
      type: 'tenant_scope' as const,
      sub: 'user-001', userId: 'user-001',
      tenantId: 'tenant-001', role: 'owner' as const, sessionId: 'session-abc',
    };

    const result = await service.enterBranch(ownerClaims, 'branch-001');
    expect(result.accessToken).toBe('mock.access.token');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'branch_scope', branchId: 'branch-001', tenantId: 'tenant-001' }),
      expect.any(Object),
    );
  });

  it('enterBranch: throws when branch does not belong to tenant', async () => {
    (userRepository.branchBelongsToTenant as jest.Mock).mockResolvedValue(false);

    const ownerClaims = {
      type: 'tenant_scope' as const,
      sub: 'user-001', userId: 'user-001',
      tenantId: 'tenant-001', role: 'owner' as const, sessionId: 'session-abc',
    };

    await expect(service.enterBranch(ownerClaims, 'branch-other')).rejects.toThrow(ForbiddenException);
  });

  // ─── Exit branch ───────────────────────────────────────────────────────────

  it('exitBranch: issues tenant_scope token for owner exiting branch', async () => {
    (userRepository.findByIdWithTenantMembership as jest.Mock).mockResolvedValue({
      ...mockUser, tenantMembership: { tenantId: 'tenant-001', role: 'owner' },
    });

    const branchClaims = {
      type: 'branch_scope' as const,
      sub: 'user-001', userId: 'user-001',
      tenantId: 'tenant-001', branchId: 'branch-001', role: 'manager' as const, sessionId: 'session-abc',
    };

    const result = await service.exitBranch(branchClaims);
    expect(result.accessToken).toBe('mock.access.token');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tenant_scope', tenantId: 'tenant-001' }),
      expect.any(Object),
    );
  });

  it('exitBranch: throws when user has no TenantMembership (not an owner)', async () => {
    (userRepository.findByIdWithTenantMembership as jest.Mock).mockResolvedValue({
      ...mockUser, tenantMembership: null,
    });

    const branchClaims = {
      type: 'branch_scope' as const,
      sub: 'user-001', userId: 'user-001',
      tenantId: 'tenant-001', branchId: 'branch-001', role: 'cashier' as const, sessionId: 'session-abc',
    };

    await expect(service.exitBranch(branchClaims)).rejects.toThrow(ForbiddenException);
  });

  // ─── Refresh rotation ──────────────────────────────────────────────────────

  it('refresh: rotates token and issues new accessToken on valid session', async () => {
    const bcryptjs = await import('bcryptjs');
    const rawToken = 'valid-raw-token';
    const tokenHash = bcryptjs.hashSync(rawToken, 4);
    const sessionId = 'session-abc';

    const activeToken = {
      id: 'rt-001', userId: 'user-001', tokenHash, sessionId,
      scopeSnapshot: mockScopeSnapshot,
      expiresAt: new Date(Date.now() + 60_000), revokedAt: null,
    };

    (refreshTokenRepository.findActiveBySessionId as jest.Mock).mockResolvedValue(activeToken);
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (refreshTokenRepository.revokeById as jest.Mock).mockResolvedValue(undefined);
    (refreshTokenRepository.create as jest.Mock).mockResolvedValue({});

    const result = await service.refresh(rawToken, sessionId, ctx);

    expect(result.response.accessToken).toBe('mock.access.token');
    expect(result.newRawToken).toBeTruthy();
    expect(refreshTokenRepository.revokeById).toHaveBeenCalledWith('rt-001');
    expect(auditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.refresh', outcome: 'success' }),
    );
  });

  it('refresh: detects token reuse when session has only revoked tokens', async () => {
    const sessionId = 'session-xyz';
    (refreshTokenRepository.findActiveBySessionId as jest.Mock).mockResolvedValue(null);
    (refreshTokenRepository.findBySessionId as jest.Mock).mockResolvedValue([
      { id: 'rt-old', userId: 'user-001', tokenHash: 'hash', sessionId, scopeSnapshot: mockScopeSnapshot, revokedAt: new Date() },
    ]);
    (refreshTokenRepository.revokeAllForUser as jest.Mock).mockResolvedValue(undefined);

    await expect(service.refresh('stale-token', sessionId, ctx)).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-001');
  });

  it('refresh: detects token hash mismatch (replay on active session)', async () => {
    const bcryptjs = await import('bcryptjs');
    const sessionId = 'session-replay';
    const tokenHash = bcryptjs.hashSync('real-token', 4);
    const activeToken = {
      id: 'rt-002', userId: 'user-001', tokenHash, sessionId,
      scopeSnapshot: mockScopeSnapshot,
      expiresAt: new Date(Date.now() + 60_000), revokedAt: null,
    };

    (refreshTokenRepository.findActiveBySessionId as jest.Mock).mockResolvedValue(activeToken);
    (refreshTokenRepository.revokeAllForUser as jest.Mock).mockResolvedValue(undefined);

    await expect(service.refresh('forged-token', sessionId, ctx)).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-001');
  });

  it('refresh: throws when session has no tokens at all', async () => {
    (refreshTokenRepository.findActiveBySessionId as jest.Mock).mockResolvedValue(null);
    (refreshTokenRepository.findBySessionId as jest.Mock).mockResolvedValue([]);

    await expect(service.refresh('any', 'empty-session', ctx)).rejects.toThrow(UnauthorizedException);
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  it('logout: revokes session tokens and records audit event', async () => {
    (refreshTokenRepository.revokeBySessionId as jest.Mock).mockResolvedValue(undefined);

    await service.logout('session-001', 'user-001', ctx);

    expect(refreshTokenRepository.revokeBySessionId).toHaveBeenCalledWith('session-001');
    expect(auditService.recordAuthEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.logout', outcome: 'success' }),
    );
  });

  // ─── Access token verification ────────────────────────────────────────────

  it('verifyAccessToken: returns claims on valid branch_scope token', () => {
    const claims = {
      type: 'branch_scope', sub: 'user-001', userId: 'user-001',
      tenantId: 't-1', branchId: 'b-1', role: 'cashier', sessionId: 's-1',
    };
    (jwtService.verify as jest.Mock).mockReturnValue(claims);

    const result = service.verifyAccessToken('valid.token.here');
    expect(result).toEqual(claims);
  });

  it('verifyAccessToken: throws invalid-token on bad token', () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => { throw new Error('jwt expired'); });

    expect(() => service.verifyAccessToken('bad.token')).toThrow(UnauthorizedException);
  });

  // ─── Setup Password ────────────────────────────────────────────────────────

  it('setupPassword: activates user and marks token used on valid invite token', async () => {
    const { createHash } = await import('crypto');
    const rawToken = 'a'.repeat(64);
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    (inviteTokenRepository.findValidByHash as jest.Mock).mockResolvedValue({
      id: 'it-001', userId: 'user-001', tokenHash, expiresAt: new Date(Date.now() + 86_400_000), usedAt: null,
    });
    (userRepository.activateWithPassword as jest.Mock).mockResolvedValue({ ...mockUser, isActive: true, email: 'owner@shop.com' });
    (inviteTokenRepository.markUsed as jest.Mock).mockResolvedValue(undefined);

    const result = await service.setupPassword({ token: rawToken, password: 'str0ngPass!' });

    expect(result.activated).toBe(true);
    expect(result.email).toBe('owner@shop.com');
    expect(userRepository.activateWithPassword).toHaveBeenCalledWith('user-001', expect.any(String));
    expect(inviteTokenRepository.markUsed).toHaveBeenCalledWith('it-001');
  });

  it('setupPassword: throws invite-token-used when token already consumed', async () => {
    (inviteTokenRepository.findValidByHash as jest.Mock).mockResolvedValue(null);
    (inviteTokenRepository.findExpiredOrUsedByHash as jest.Mock).mockResolvedValue({
      id: 'it-002', usedAt: new Date(), expiresAt: new Date(Date.now() + 1000),
    });

    await expect(service.setupPassword({ token: 'any-token', password: 'str0ngPass!' }))
      .rejects.toThrow(BadRequestException);
    expect(userRepository.activateWithPassword).not.toHaveBeenCalled();
  });

  it('setupPassword: throws invite-token-expired when token TTL passed', async () => {
    (inviteTokenRepository.findValidByHash as jest.Mock).mockResolvedValue(null);
    (inviteTokenRepository.findExpiredOrUsedByHash as jest.Mock).mockResolvedValue({
      id: 'it-003', usedAt: null, expiresAt: new Date(Date.now() - 1000),
    });

    await expect(service.setupPassword({ token: 'expired-token', password: 'str0ngPass!' }))
      .rejects.toThrow(BadRequestException);
  });

  it('setupPassword: throws invalid-invite-token when token not found', async () => {
    (inviteTokenRepository.findValidByHash as jest.Mock).mockResolvedValue(null);
    (inviteTokenRepository.findExpiredOrUsedByHash as jest.Mock).mockResolvedValue(null);

    await expect(service.setupPassword({ token: 'ghost-token', password: 'str0ngPass!' }))
      .rejects.toThrow(BadRequestException);
  });

  it('setupPassword: throws weak-password when password too short', async () => {
    await expect(service.setupPassword({ token: 'any', password: 'short' }))
      .rejects.toThrow(BadRequestException);
    expect(inviteTokenRepository.findValidByHash).not.toHaveBeenCalled();
  });
});
