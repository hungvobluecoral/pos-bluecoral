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

@Injectable()
export class AuditService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async recordProvisioning(entry: AuditProvisioningEntry) {
    await this.auditLogRepository.create(entry);
  }
}
