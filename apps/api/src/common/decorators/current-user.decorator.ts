import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AccessTokenClaims } from '@pos-bluecoral/contracts';

export type AuthenticatedRequest = Request & { user?: AccessTokenClaims };

/**
 * Extracts the authenticated user claims from the request.
 * Only valid on routes protected by JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenClaims => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user!;
  },
);
