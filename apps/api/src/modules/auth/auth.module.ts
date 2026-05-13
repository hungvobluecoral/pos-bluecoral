import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditModule } from '../audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InviteTokenRepository } from './repositories/invite-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '15m';

@Module({
  imports: [
    AuditModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, RefreshTokenRepository, InviteTokenRepository],
  exports: [AuthService],
})
export class AuthModule {}
