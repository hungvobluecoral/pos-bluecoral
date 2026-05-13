import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { BranchMembershipRole } from '@pos-bluecoral/contracts';
import { ROLES_KEY, ScopedRole } from '../decorators/require-roles.decorator';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

const ROLE_HIERARCHY: Record<ScopedRole, number> = {
  owner: 4,
  manager: 3,
  cashier: 2,
  viewer: 1,
};

/**
 * Layer 3 guard: enforces role hierarchy after ScopeGuard has validated JWT type.
 *
 * Uses @RequireRoles(...) decorator to declare the minimum role(s) allowed.
 * Role hierarchy: owner(4) > manager(3) > cashier(2) > viewer(1)
 * A higher-ranked role satisfies a lower requirement (e.g. manager can access cashier routes).
 *
 * Routes without @RequireRoles pass automatically.
 * Routes with super_admin JWT have no role — they should be blocked by ScopeGuard first.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ScopedRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({ code: 'missing-token', message: 'Người dùng chưa xác thực.' });
    }

    const role = 'role' in user ? (user as { role: BranchMembershipRole | 'owner' }).role : undefined;
    const userLevel = role ? (ROLE_HIERARCHY[role] ?? 0) : 0;
    const meetsAny = requiredRoles.some((r) => userLevel >= ROLE_HIERARCHY[r]);

    if (!meetsAny) {
      throw new ForbiddenException({
        code: 'insufficient-role',
        message: `Hành động này yêu cầu một trong các vai trò: ${requiredRoles.join(', ')}.`,
      });
    }

    return true;
  }
}
