import { SetMetadata } from '@nestjs/common';
import type { BranchMembershipRole } from '@pos-bluecoral/contracts';

export type ScopedRole = BranchMembershipRole | 'owner';

export const ROLES_KEY = 'required_roles';

/**
 * Specifies the minimum roles allowed for a route.
 * Use with JwtAuthGuard + ScopeGuard.
 */
export const RequireRoles = (...roles: ScopedRole[]) => SetMetadata(ROLES_KEY, roles);
