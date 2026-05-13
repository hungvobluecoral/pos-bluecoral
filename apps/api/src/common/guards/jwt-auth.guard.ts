import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AccessTokenClaims } from '@pos-bluecoral/contracts';
import { AuthService } from '../../modules/auth/auth.service';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'missing-token', message: 'Authorization header bắt buộc.' });
    }

    const token = authHeader.slice(7);
    const claims: AccessTokenClaims = this.authService.verifyAccessToken(token);

    request.user = claims;
    return true;
  }
}
