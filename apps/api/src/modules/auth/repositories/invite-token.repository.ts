import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface InviteTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

@Injectable()
export class InviteTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Hash a raw invite token with SHA-256 for constant-time-safe lookup. */
  static hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async findValidByHash(tokenHash: string): Promise<InviteTokenRecord | null> {
    return this.prisma.inviteToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        usedAt: true,
      },
    });
  }

  async findExpiredOrUsedByHash(tokenHash: string): Promise<InviteTokenRecord | null> {
    return this.prisma.inviteToken.findFirst({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        usedAt: true,
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.inviteToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /** Create a new invite token. Returns both the raw token (for email) and its hash (for DB). */
  async create(userId: string, ttlMs: number): Promise<{ rawToken: string; record: InviteTokenRecord }> {
    const { randomBytes } = await import('crypto');
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = InviteTokenRepository.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlMs);

    const record = await this.prisma.inviteToken.create({
      data: { userId, tokenHash, expiresAt },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    return { rawToken, record };
  }
}
