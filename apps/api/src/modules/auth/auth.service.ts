import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import {
  AccessTokenClaims,
  BranchMembershipRole,
  BranchScopeClaims,
  BranchSelectPendingClaims,
  EnterBranchResponse,
  ExitBranchResponse,
  LoginDirectResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ScopeSnapshot,
  SelectBranchResponse,
  SetupPasswordRequest,
  SetupPasswordResponse,
  SuperAdminClaims,
  TenantScopeClaims,
} from '@pos-bluecoral/contracts';
import { AuditService } from '../audit/audit.service';
import { InviteTokenRepository } from './repositories/invite-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_TTL_S = 15 * 60;                    // 15 minutes
const BRANCH_SELECT_TOKEN_TTL_S = 5 * 60;              // 5 minutes
const MIN_PASSWORD_LENGTH = 8;

export interface AuthContext {
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly inviteTokenRepository: InviteTokenRepository,
  ) {}

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(
    payload: LoginRequest,
    ctx: AuthContext,
  ): Promise<{ response: LoginResponse; rawRefreshToken?: string }> {
    const user = await this.userRepository.findByEmailWithMemberships(payload.email);

    if (!user) {
      await this.auditService.recordAuthEvent({
        actorId: payload.email,
        action: 'auth.login',
        requestId: ctx.requestId,
        outcome: 'failure',
        details: { reason: 'user-not-found', email: payload.email },
      });
      throw new UnauthorizedException({ code: 'invalid-credentials', message: 'Email hoặc mật khẩu không đúng.' });
    }

    if (!user.isActive) {
      await this.auditService.recordAuthEvent({
        actorId: user.id,
        action: 'auth.login',
        requestId: ctx.requestId,
        outcome: 'failure',
        details: { reason: 'account-inactive' },
      });
      throw new UnauthorizedException({ code: 'account-inactive', message: 'Tài khoản chưa được kích hoạt.' });
    }

    if (!compareSync(payload.password, user.passwordHash)) {
      await this.auditService.recordAuthEvent({
        actorId: user.id,
        action: 'auth.login',
        requestId: ctx.requestId,
        outcome: 'failure',
        details: { reason: 'invalid-password' },
      });
      throw new UnauthorizedException({ code: 'invalid-credentials', message: 'Email hoặc mật khẩu không đúng.' });
    }

    const sessionId = randomUUID();

    // ── Super Admin ────────────────────────────────────────────────────────
    if (user.isSuperAdmin) {
      const snapshot: ScopeSnapshot = { type: 'super_admin' };
      const { accessToken, expiresIn } = this.issueAccessToken({ type: 'super_admin', sub: user.id, userId: user.id, sessionId });
      const rawRefreshToken = await this.createRefreshToken(user.id, sessionId, snapshot, ctx);
      await this.auditService.recordAuthEvent({
        actorId: user.id, action: 'auth.login', requestId: ctx.requestId, outcome: 'success',
        details: { sessionId, jwtType: 'super_admin' },
      });
      const response: LoginDirectResponse = { outcome: 'authenticated', accessToken, expiresIn, userId: user.id, sessionId };
      return { response, rawRefreshToken };
    }

    // ── Owner (TenantMembership) ───────────────────────────────────────────
    if (user.tenantMembership) {
      const { tenantId, role } = user.tenantMembership;
      const snapshot: ScopeSnapshot = { type: 'tenant_scope', tenantId, role: role as 'owner' };
      const claims: TenantScopeClaims = { type: 'tenant_scope', sub: user.id, userId: user.id, tenantId, role: 'owner', sessionId };
      const { accessToken, expiresIn } = this.issueAccessToken(claims);
      const rawRefreshToken = await this.createRefreshToken(user.id, sessionId, snapshot, ctx);
      await this.auditService.recordAuthEvent({
        actorId: user.id, action: 'auth.login', requestId: ctx.requestId, outcome: 'success',
        tenantId, details: { sessionId, jwtType: 'tenant_scope' },
      });
      const response: LoginDirectResponse = { outcome: 'authenticated', accessToken, expiresIn, userId: user.id, sessionId };
      return { response, rawRefreshToken };
    }

    // ── Single BranchMembership ────────────────────────────────────────────
    if (user.branchMemberships.length === 1) {
      const bm = user.branchMemberships[0]!;
      const snapshot: ScopeSnapshot = { type: 'branch_scope', tenantId: bm.tenantId, branchId: bm.branchId, role: bm.role as BranchMembershipRole };
      const claims: BranchScopeClaims = { type: 'branch_scope', sub: user.id, userId: user.id, tenantId: bm.tenantId, branchId: bm.branchId, role: bm.role as BranchMembershipRole, sessionId };
      const { accessToken, expiresIn } = this.issueAccessToken(claims);
      const rawRefreshToken = await this.createRefreshToken(user.id, sessionId, snapshot, ctx);
      await this.auditService.recordAuthEvent({
        actorId: user.id, action: 'auth.login', requestId: ctx.requestId, outcome: 'success',
        tenantId: bm.tenantId, branchId: bm.branchId, details: { sessionId, jwtType: 'branch_scope', role: bm.role },
      });
      const response: LoginDirectResponse = { outcome: 'authenticated', accessToken, expiresIn, userId: user.id, sessionId };
      return { response, rawRefreshToken };
    }

    // ── Multiple BranchMemberships — require branch selection ──────────────
    if (user.branchMemberships.length > 1) {
      const pendingClaims: BranchSelectPendingClaims = { type: 'branch_select_pending', sub: user.id, userId: user.id, sessionId };
      const sessionToken = this.jwtService.sign(pendingClaims, { expiresIn: BRANCH_SELECT_TOKEN_TTL_S });
      await this.auditService.recordAuthEvent({
        actorId: user.id, action: 'auth.login', requestId: ctx.requestId, outcome: 'success',
        details: { sessionId, jwtType: 'branch_select_pending', branchCount: user.branchMemberships.length },
      });
      return {
        response: {
          outcome: 'branch_select_required',
          sessionToken,
          branches: user.branchMemberships.map((bm) => ({
            branchId: bm.branchId,
            branchName: bm.branchName,
            role: bm.role as BranchMembershipRole,
          })),
        },
      };
    }

    // ── No memberships at all ──────────────────────────────────────────────
    await this.auditService.recordAuthEvent({
      actorId: user.id, action: 'auth.login', requestId: ctx.requestId, outcome: 'failure',
      details: { reason: 'no-memberships' },
    });
    throw new UnauthorizedException({ code: 'account-inactive', message: 'Tài khoản chưa được gán vào bất kỳ tenant hoặc branch nào.' });
  }

  // ─── Select Branch (multi-branch users) ──────────────────────────────────

  async selectBranch(
    sessionToken: string,
    branchId: string,
    ctx: AuthContext,
  ): Promise<{ response: SelectBranchResponse; rawRefreshToken: string }> {
    let pending: BranchSelectPendingClaims;
    try {
      pending = this.jwtService.verify<BranchSelectPendingClaims>(sessionToken);
    } catch {
      throw new UnauthorizedException({ code: 'invalid-session-token', message: 'Session token không hợp lệ hoặc đã hết hạn.' });
    }

    if (pending.type !== 'branch_select_pending') {
      throw new UnauthorizedException({ code: 'invalid-session-token', message: 'Session token không hợp lệ.' });
    }

    const bm = await this.userRepository.findBranchMembership(pending.userId, branchId);
    if (!bm) {
      throw new ForbiddenException({ code: 'branch-not-found', message: 'Branch không tồn tại hoặc bạn không có quyền truy cập.' });
    }

    const sessionId = pending.sessionId;
    const snapshot: ScopeSnapshot = { type: 'branch_scope', tenantId: bm.tenantId, branchId: bm.branchId, role: bm.role as BranchMembershipRole };
    const claims: BranchScopeClaims = { type: 'branch_scope', sub: pending.userId, userId: pending.userId, tenantId: bm.tenantId, branchId: bm.branchId, role: bm.role as BranchMembershipRole, sessionId };
    const { accessToken, expiresIn } = this.issueAccessToken(claims);
    const rawRefreshToken = await this.createRefreshToken(pending.userId, sessionId, snapshot, ctx);

    await this.auditService.recordAuthEvent({
      actorId: pending.userId, action: 'auth.select-branch', requestId: ctx.requestId, outcome: 'success',
      tenantId: bm.tenantId, branchId: bm.branchId, details: { sessionId, role: bm.role },
    });

    return { response: { accessToken, expiresIn, userId: pending.userId, sessionId }, rawRefreshToken };
  }

  // ─── Enter Branch (Owner dual-context) ────────────────────────────────────

  async enterBranch(ownerClaims: TenantScopeClaims, branchId: string): Promise<EnterBranchResponse> {
    const belongs = await this.userRepository.branchBelongsToTenant(branchId, ownerClaims.tenantId);
    if (!belongs) {
      throw new ForbiddenException({ code: 'branch-not-found', message: 'Branch không thuộc tenant này.' });
    }

    const claims: BranchScopeClaims = {
      type: 'branch_scope',
      sub: ownerClaims.userId,
      userId: ownerClaims.userId,
      tenantId: ownerClaims.tenantId,
      branchId,
      role: 'manager',
      sessionId: ownerClaims.sessionId,
    };
    const { accessToken, expiresIn } = this.issueAccessToken(claims);
    return { accessToken, expiresIn };
  }

  // ─── Exit Branch (Owner returns to tenant_scope) ──────────────────────────

  async exitBranch(branchClaims: BranchScopeClaims): Promise<ExitBranchResponse> {
    const user = await this.userRepository.findByIdWithTenantMembership(branchClaims.userId);
    if (!user?.tenantMembership) {
      throw new ForbiddenException({ code: 'scope-mismatch', message: 'Chỉ Owner mới có thể thoát branch context.' });
    }

    const claims: TenantScopeClaims = {
      type: 'tenant_scope',
      sub: branchClaims.userId,
      userId: branchClaims.userId,
      tenantId: user.tenantMembership.tenantId,
      role: 'owner',
      sessionId: branchClaims.sessionId,
    };
    const { accessToken, expiresIn } = this.issueAccessToken(claims);
    return { accessToken, expiresIn };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────

  async refresh(
    rawRefreshToken: string,
    sessionId: string,
    ctx: AuthContext,
  ): Promise<{ response: RefreshResponse; newRawToken: string }> {
    const activeToken = await this.refreshTokenRepository.findActiveBySessionId(sessionId);

    if (!activeToken) {
      const allTokens = await this.refreshTokenRepository.findBySessionId(sessionId);
      if (allTokens.length > 0) {
        const userId = allTokens[0]!.userId;
        await this.refreshTokenRepository.revokeAllForUser(userId);
        await this.auditService.recordAuthEvent({
          actorId: userId, action: 'auth.refresh', requestId: ctx.requestId, outcome: 'failure',
          details: { reason: 'token-reuse-detected', sessionId },
        });
      }
      throw new UnauthorizedException({ code: 'token-revoked', message: 'Session không hợp lệ hoặc đã hết hạn.' });
    }

    if (!compareSync(rawRefreshToken, activeToken.tokenHash)) {
      await this.refreshTokenRepository.revokeAllForUser(activeToken.userId);
      await this.auditService.recordAuthEvent({
        actorId: activeToken.userId, action: 'auth.refresh', requestId: ctx.requestId, outcome: 'failure',
        details: { reason: 'token-reuse-detected', sessionId },
      });
      throw new UnauthorizedException({ code: 'token-reuse-detected', message: 'Phát hiện replay token — session đã bị thu hồi.' });
    }

    const user = await this.userRepository.findById(activeToken.userId);
    if (!user || !user.isActive) {
      await this.refreshTokenRepository.revokeBySessionId(sessionId);
      throw new UnauthorizedException({ code: 'account-inactive', message: 'Tài khoản không hợp lệ.' });
    }

    await this.refreshTokenRepository.revokeById(activeToken.id);
    const newRawToken = await this.createRefreshToken(user.id, sessionId, activeToken.scopeSnapshot, ctx);
    const { accessToken, expiresIn } = this.issueAccessTokenFromSnapshot(user.id, sessionId, activeToken.scopeSnapshot);

    await this.auditService.recordAuthEvent({
      actorId: user.id, action: 'auth.refresh', requestId: ctx.requestId, outcome: 'success',
      details: { sessionId, jwtType: activeToken.scopeSnapshot.type },
    });

    return { response: { accessToken, expiresIn }, newRawToken };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(sessionId: string, actorId: string, ctx: AuthContext): Promise<void> {
    await this.refreshTokenRepository.revokeBySessionId(sessionId);
    await this.auditService.recordAuthEvent({
      actorId,
      action: 'auth.logout',
      requestId: ctx.requestId,
      outcome: 'success',
      details: { sessionId },
    });
  }

  // ─── Setup Password (invite token activation) ─────────────────────────────

  async setupPassword(payload: SetupPasswordRequest): Promise<SetupPasswordResponse> {
    if (!payload.password || payload.password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException({
        code: 'weak-password',
        message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
      });
    }

    const tokenHash = InviteTokenRepository.hashToken(payload.token);
    const inviteToken = await this.inviteTokenRepository.findValidByHash(tokenHash);

    if (!inviteToken) {
      // Distinguish used vs expired vs not-found — all return same error to avoid enumeration
      const any = await this.inviteTokenRepository.findExpiredOrUsedByHash(tokenHash);
      if (any?.usedAt) {
        throw new BadRequestException({ code: 'invite-token-used', message: 'Token này đã được sử dụng.' });
      }
      if (any?.expiresAt && any.expiresAt < new Date()) {
        throw new BadRequestException({ code: 'invite-token-expired', message: 'Token đã hết hạn. Liên hệ quản trị viên để nhận lại lời mời.' });
      }
      throw new BadRequestException({ code: 'invalid-invite-token', message: 'Token không hợp lệ.' });
    }

    const passwordHash = hashSync(payload.password, BCRYPT_ROUNDS);
    const user = await this.userRepository.activateWithPassword(inviteToken.userId, passwordHash);
    await this.inviteTokenRepository.markUsed(inviteToken.id);

    return { activated: true, email: user.email };
  }

  // ─── Token verification ────────────────────────────────────────────────────

  verifyAccessToken(token: string): AccessTokenClaims {
    try {
      return this.jwtService.verify<AccessTokenClaims>(token);
    } catch {
      throw new UnauthorizedException({ code: 'invalid-token', message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private issueAccessToken(claims: AccessTokenClaims | BranchSelectPendingClaims) {
    const accessToken = this.jwtService.sign(claims as object, { expiresIn: ACCESS_TOKEN_TTL_S });
    return { accessToken, expiresIn: ACCESS_TOKEN_TTL_S };
  }

  private issueAccessTokenFromSnapshot(userId: string, sessionId: string, snapshot: ScopeSnapshot) {
    let claims: AccessTokenClaims;
    switch (snapshot.type) {
      case 'super_admin':
        claims = { type: 'super_admin', sub: userId, userId, sessionId };
        break;
      case 'tenant_scope':
        claims = { type: 'tenant_scope', sub: userId, userId, tenantId: snapshot.tenantId, role: snapshot.role, sessionId };
        break;
      case 'branch_scope':
        claims = { type: 'branch_scope', sub: userId, userId, tenantId: snapshot.tenantId, branchId: snapshot.branchId, role: snapshot.role, sessionId };
        break;
    }
    return this.issueAccessToken(claims);
  }

  private async createRefreshToken(
    userId: string,
    sessionId: string,
    scopeSnapshot: ScopeSnapshot,
    ctx: AuthContext,
  ): Promise<string> {
    const raw = randomBytes(48).toString('hex');
    const tokenHash = hashSync(raw, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      sessionId,
      scopeSnapshot,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
      expiresAt,
    });

    return raw;
  }
}
