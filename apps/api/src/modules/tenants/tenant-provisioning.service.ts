import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ProvisionTenantRequest,
  ProvisionTenantResult,
} from '@pos-bluecoral/contracts';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BranchesRepository } from '../branches/repositories/branches.repository';
import {
  normalizeProvisionTenantRequest,
  validateProvisionTenantRequest,
} from './dto/provision-tenant.dto';
import { TenantsRepository } from './repositories/tenants.repository';

export interface ProvisionTenantContext {
  requestId: string;
  scopedTenantId?: string;
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsRepository: TenantsRepository,
    private readonly branchesRepository: BranchesRepository,
    private readonly auditService: AuditService,
  ) {}

  async provision(
    payload: ProvisionTenantRequest,
    context: ProvisionTenantContext,
  ): Promise<ProvisionTenantResult> {
    const normalizedPayload = normalizeProvisionTenantRequest(payload);
    const validationIssues = validateProvisionTenantRequest(normalizedPayload);

    if (validationIssues.length > 0) {
      await this.auditFailure(normalizedPayload.actorId, context.requestId, {
        code: 'validation-failed',
        validationIssues,
      });
      throw new BadRequestException({
        code: 'validation-failed',
        message: 'Payload provisioning tenant/branch không hợp lệ.',
        details: validationIssues,
      });
    }

    if (context.scopedTenantId) {
      await this.auditFailure(normalizedPayload.actorId, context.requestId, {
        code: 'scope-mismatch',
        scopedTenantId: context.scopedTenantId,
      });
      throw new ConflictException({
        code: 'scope-mismatch',
        message:
          'Provisioning tenant mới không chấp nhận tenant scope đã được gắn sẵn.',
        details: {
          scopedTenantId: context.scopedTenantId,
        },
      });
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existingTenant = await this.tenantsRepository.findBySlug(
          tx,
          normalizedPayload.tenantSlug,
        );

        if (existingTenant) {
          throw new ConflictException({
            code: 'tenant-already-exists',
            message: 'tenantSlug đã tồn tại.',
            details: {
              tenantSlug: normalizedPayload.tenantSlug,
            },
          });
        }

        const tenant = await this.tenantsRepository.createTenant(
          tx,
          normalizedPayload,
        );
        const branch = await this.branchesRepository.createInitialBranch(
          tx,
          tenant.id,
          normalizedPayload,
        );

        return {
          branchId: branch.id,
          tenantId: tenant.id,
          branch: {
            code: branch.code,
            name: branch.name,
            slug: branch.slug,
          },
          tenant: {
            name: tenant.name,
            slug: tenant.slug,
          },
        };
      });

      await this.auditService.recordProvisioning({
        action: 'tenant.provisioning',
        actorId: normalizedPayload.actorId,
        branchId: result.branchId,
        outcome: 'success',
        requestId: context.requestId,
        tenantId: result.tenantId,
      });

      this.logger.log(
        JSON.stringify({
          action: 'tenant.provisioning',
          actorId: normalizedPayload.actorId,
          branchId: result.branchId,
          requestId: context.requestId,
          tenantId: result.tenantId,
        }),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        await this.auditFailure(normalizedPayload.actorId, context.requestId, {
          error: this.extractErrorPayload(error),
        });
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const conflictException = this.mapUniqueConstraintError(error);
          await this.auditFailure(normalizedPayload.actorId, context.requestId, {
            error: this.extractErrorPayload(conflictException),
          });
          throw conflictException;
        }
      }

      await this.auditFailure(normalizedPayload.actorId, context.requestId, {
        code: 'unexpected-error',
        message: error instanceof Error ? error.message : 'unknown',
      });
      this.logger.error(
        JSON.stringify({
          action: 'tenant.provisioning',
          actorId: normalizedPayload.actorId,
          error: error instanceof Error ? error.message : 'unknown',
          requestId: context.requestId,
        }),
      );
      throw error;
    }
  }

  private extractErrorPayload(error: HttpException) {
    const response = error.getResponse();
    return typeof response === 'string' ? { message: response } : response;
  }

  private async auditFailure(
    actorId: string,
    requestId: string,
    details: Record<string, unknown>,
  ) {
    await this.auditService.recordProvisioning({
      action: 'tenant.provisioning',
      actorId,
      details,
      outcome: 'failure',
      requestId,
    });
  }

  private mapUniqueConstraintError(error: Prisma.PrismaClientKnownRequestError) {
    const targets = this.extractTargets(error.meta);

    if (targets.includes('slug')) {
      return new ConflictException({
        code: 'tenant-already-exists',
        message: 'tenantSlug đã tồn tại.',
      });
    }

    if (targets.includes('code')) {
      return new ConflictException({
        code: 'branch-already-exists',
        message: 'branchCode đã tồn tại trong tenant.',
      });
    }

    return new ConflictException({
      code: 'conflict',
      message: 'Dữ liệu provisioning bị xung đột.',
    });
  }

  private extractTargets(meta: Prisma.PrismaClientKnownRequestError['meta']) {
    if (!meta || !('target' in meta)) {
      return [];
    }

    const target = meta.target;
    if (Array.isArray(target)) {
      return target.map((item) => String(item));
    }

    return [String(target)];
  }
}
