import { AuditOutcome } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './repositories/audit-log.repository';

export interface AuditProvisioningEntry {
  actorId: string;
  action: 'tenant.provisioning';
  requestId: string;
  outcome: AuditOutcome;
  tenantId?: string;
  branchId?: string;
  details?: Record<string, unknown>;
}

export type AuthAuditAction =
  | 'auth.login'
  | 'auth.refresh'
  | 'auth.logout'
  | 'auth.access-denied'
  | 'auth.select-branch'
  | 'auth.enter-branch'
  | 'auth.exit-branch';

export interface AuditAuthEntry {
  actorId: string;
  action: AuthAuditAction;
  requestId: string;
  outcome: 'success' | 'failure';
  tenantId?: string;
  branchId?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async recordProvisioning(entry: AuditProvisioningEntry) {
    await this.auditLogRepository.create({
      ...entry,
    });
  }

  async recordAuthEvent(entry: AuditAuthEntry) {
    await this.auditLogRepository.create({
      ...entry,
      outcome: entry.outcome === 'success' ? AuditOutcome.success : AuditOutcome.failure,
    });
  }
}

