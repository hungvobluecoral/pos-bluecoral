import { AuditOutcome, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface AuditLogEntry {
  actorId: string;
  action: string;
  requestId: string;
  outcome: AuditOutcome;
  tenantId?: string;
  branchId?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entry: AuditLogEntry) {
    const details = entry.details as Prisma.InputJsonValue | undefined;

    await this.prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId,
        branchId: entry.branchId,
        details,
        outcome: entry.outcome,
        requestId: entry.requestId,
        tenantId: entry.tenantId,
      },
    });
  }
}

