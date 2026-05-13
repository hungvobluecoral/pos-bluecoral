import { ForbiddenException } from '@nestjs/common';
import type { AccessTokenClaims, TenantScopeClaims, BranchScopeClaims } from '@pos-bluecoral/contracts';

/**
 * Asserts that the authenticated user's tenantId matches the expected tenantId.
 * Only valid for tenant_scope and branch_scope JWTs.
 */
export function assertTenantScope(user: AccessTokenClaims, expectedTenantId: string): void {
  const scoped = user as TenantScopeClaims | BranchScopeClaims;
  if (!('tenantId' in scoped) || scoped.tenantId !== expectedTenantId) {
    throw new ForbiddenException({
      code: 'scope-mismatch',
      message: 'Thao tác không thuộc phạm vi tenant được cấp.',
    });
  }
}

/**
 * Asserts that the authenticated user's branchId matches the expected branchId.
 * Only valid for branch_scope JWTs.
 */
export function assertBranchScope(user: AccessTokenClaims, expectedBranchId: string): void {
  const scoped = user as BranchScopeClaims;
  if (!('branchId' in scoped) || scoped.branchId !== expectedBranchId) {
    throw new ForbiddenException({
      code: 'scope-mismatch',
      message: 'Thao tác không thuộc phạm vi branch được cấp.',
    });
  }
}
