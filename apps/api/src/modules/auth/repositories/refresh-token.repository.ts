import { Injectable } from '@nestjs/common';
import { ScopeSnapshot } from '@pos-bluecoral/contracts';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  sessionId: string;
  scopeSnapshot: ScopeSnapshot;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  sessionId: string;
  scopeSnapshot: ScopeSnapshot;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const record = await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        sessionId: input.sessionId,
        scopeSnapshot: input.scopeSnapshot as object,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        expiresAt: input.expiresAt,
      },
    });
    return record as unknown as RefreshTokenRecord;
  }

  async findActiveBySessionId(sessionId: string): Promise<RefreshTokenRecord | null> {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        sessionId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return token as unknown as RefreshTokenRecord | null;
  }

  async findBySessionId(sessionId: string): Promise<RefreshTokenRecord[]> {
    const records = await this.prisma.refreshToken.findMany({
      where: { sessionId },
    });
    return records as unknown as RefreshTokenRecord[];
  }

  async revokeBySessionId(sessionId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
