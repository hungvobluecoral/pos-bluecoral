import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_SUPER_ADMIN_KEY, AllowedJwtType, SCOPE_TYPES_KEY } from '../decorators/require-scope.decorator';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

/**
 * Layer 2 guard: validates the JWT *type* for a route.
 *
 * Rules:
 * - `branch_select_pending` JWT is always rejected (session-only token for /auth/select-branch).
 * - `super_admin` JWT is blocked from all routes UNLESS @AllowSuperAdmin() is present.
 * - If @RequireJwtTypes(...) is present, the user's JWT type must be in the list.
 * - If neither decorator is present, all non-SA, non-pending types pass.
 *
 * Must run after JwtAuthGuard has populated request.user.
 */
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({ code: 'missing-token', message: 'Người dùng chưa xác thực.' });
    }

    // branch_select_pending is a one-time session token — never allowed past this guard.
    // Cast through unknown because it's not part of the AccessTokenClaims union.
    if ((user as unknown as { type: string }).type === 'branch_select_pending') {
      throw new ForbiddenException({
        code: 'pending-branch-select',
        message: 'Vui lòng chọn branch trước khi tiếp tục. POST /auth/select-branch',
      });
    }

    const allowSuperAdmin = this.reflector.getAllAndOverride<boolean>(ALLOW_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (user.type === 'super_admin' && !allowSuperAdmin) {
      throw new ForbiddenException({
        code: 'super-admin-blocked',
        message: 'Super admin không được phép truy cập route nghiệp vụ này.',
      });
    }

    const requiredTypes = this.reflector.getAllAndOverride<AllowedJwtType[]>(SCOPE_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTypes || requiredTypes.length === 0) {
      return true;
    }

    if (!requiredTypes.includes(user.type as AllowedJwtType)) {
      throw new ForbiddenException({
        code: 'scope-type-mismatch',
        message: `Route này yêu cầu JWT thuộc loại: ${requiredTypes.join(' | ')}. Hiện tại: ${user.type}.`,
      });
    }

    return true;
  }
}
