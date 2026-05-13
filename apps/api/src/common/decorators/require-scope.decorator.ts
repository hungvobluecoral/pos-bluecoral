import { SetMetadata } from '@nestjs/common';

export type AllowedJwtType = 'super_admin' | 'tenant_scope' | 'branch_scope';

export const SCOPE_TYPES_KEY = 'required_jwt_types';

/**
 * Declares which JWT types are permitted on a route.
 *
 * Examples:
 *   @RequireJwtTypes('branch_scope')           — only branch-scoped users
 *   @RequireJwtTypes('tenant_scope', 'branch_scope') — owner or branch user
 *   @RequireJwtTypes('super_admin')            — super admin only
 *
 * If omitted, ScopeGuard blocks super_admin by default (business routes).
 * Use @AllowSuperAdmin() if the route intentionally serves super admins.
 */
export const RequireJwtTypes = (...types: AllowedJwtType[]) =>
  SetMetadata(SCOPE_TYPES_KEY, types);

export const ALLOW_SUPER_ADMIN_KEY = 'allow_super_admin';

/**
 * Marks a route as accessible to super_admin JWT type.
 * Without this, ScopeGuard rejects super_admin on all business routes.
 */
export const AllowSuperAdmin = () => SetMetadata(ALLOW_SUPER_ADMIN_KEY, true);
