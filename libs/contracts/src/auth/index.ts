// ─── Roles ───────────────────────────────────────────────────────────────────

export type TenantMembershipRole = 'owner';
export type BranchMembershipRole = 'manager' | 'cashier' | 'viewer';

// ─── JWT claims — discriminated union, zero nullable claims ──────────────────

export interface SuperAdminClaims {
  type: 'super_admin';
  sub: string;
  userId: string;
  sessionId: string;
}

export interface TenantScopeClaims {
  type: 'tenant_scope';
  sub: string;
  userId: string;
  tenantId: string;
  role: TenantMembershipRole;
  sessionId: string;
}

export interface BranchScopeClaims {
  type: 'branch_scope';
  sub: string;
  userId: string;
  tenantId: string;
  branchId: string;
  role: BranchMembershipRole;
  sessionId: string;
}

export type AccessTokenClaims = SuperAdminClaims | TenantScopeClaims | BranchScopeClaims;

// Short-lived token for the multi-branch selection step (no refresh token issued)
export interface BranchSelectPendingClaims {
  type: 'branch_select_pending';
  sub: string;
  userId: string;
  sessionId: string;
}

// ─── Scope snapshot — stored in RefreshToken for scope-preserving rotation ───

export type ScopeSnapshot =
  | { type: 'super_admin' }
  | { type: 'tenant_scope'; tenantId: string; role: TenantMembershipRole }
  | { type: 'branch_scope'; tenantId: string; branchId: string; role: BranchMembershipRole };

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginDirectResponse {
  outcome: 'authenticated';
  accessToken: string;
  expiresIn: number;
  userId: string;
  sessionId: string;
}

export interface LoginBranchSelectResponse {
  outcome: 'branch_select_required';
  sessionToken: string;
  branches: Array<{ branchId: string; branchName: string; role: BranchMembershipRole }>;
}

export type LoginResponse = LoginDirectResponse | LoginBranchSelectResponse;

// ─── Select Branch (multi-branch users) ──────────────────────────────────────

export interface SelectBranchRequest {
  sessionToken: string;
  branchId: string;
}

export interface SelectBranchResponse {
  accessToken: string;
  expiresIn: number;
  userId: string;
  sessionId: string;
}

// ─── Enter / Exit Branch (Owner dual-context) ────────────────────────────────

export interface EnterBranchRequest {
  branchId: string;
}

export interface EnterBranchResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ExitBranchResponse {
  accessToken: string;
  expiresIn: number;
}

// ─── Refresh ─────────────────────────────────────────────────────────────────

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// ─── Error codes ─────────────────────────────────────────────────────────────

export type AuthErrorCode =
  | 'invalid-credentials'
  | 'account-inactive'
  | 'token-expired'
  | 'token-revoked'
  | 'token-reuse-detected'
  | 'scope-mismatch'
  | 'insufficient-role'
  | 'missing-token'
  | 'invalid-token'
  | 'branch-not-found'
  | 'invalid-session-token'
  | 'invalid-invite-token'
  | 'invite-token-expired'
  | 'invite-token-used'
  | 'weak-password';

// ─── Setup Password (invite token activation) ────────────────────────────────

export interface SetupPasswordRequest {
  /** Raw invite token received by email */
  token: string;
  /** New password — min 8 characters */
  password: string;
}

export interface SetupPasswordResponse {
  activated: boolean;
  email: string;
}
