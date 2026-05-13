import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { hashSync } from 'bcryptjs';
import {
  ApproveRegistrationResponse,
  ListRegistrationsResponse,
  RegistrationStatus,
  RejectRegistrationResponse,
  SubmitRegistrationRequest,
  SubmitRegistrationResponse,
} from '@pos-bluecoral/contracts';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RegistrationRecord, RegistrationRepository } from './repositories/registration.repository';

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 60);
}

function toSummary(r: RegistrationRecord) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    businessName: r.businessName,
    status: r.status,
    reviewNote: r.reviewNote,
    createdAt: r.createdAt.toISOString(),
  };
}

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  // ─── Public submit ────────────────────────────────────────────────────────

  async submit(payload: SubmitRegistrationRequest): Promise<SubmitRegistrationResponse> {
    const existing = await this.registrationRepository.findPendingByEmail(payload.email);
    if (existing) {
      throw new ConflictException({
        code: 'registration-pending',
        message: 'Đăng ký với email này đang chờ xét duyệt.',
      });
    }

    const registration = await this.registrationRepository.create(payload);
    this.logger.log(JSON.stringify({ action: 'registration.submit', id: registration.id, email: payload.email }));

    return {
      registrationId: registration.id,
      status: 'PENDING',
      message: 'Đăng ký đã được ghi nhận. Chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc.',
    };
  }

  // ─── SA list ──────────────────────────────────────────────────────────────

  async list(status?: RegistrationStatus): Promise<ListRegistrationsResponse> {
    const items = await this.registrationRepository.listByStatus(status);
    return { items: items.map(toSummary), total: items.length };
  }

  // ─── SA approve ───────────────────────────────────────────────────────────

  async approve(id: string, actorId: string): Promise<ApproveRegistrationResponse> {
    const reg = await this.registrationRepository.findById(id);
    if (!reg) throw new NotFoundException({ code: 'registration-not-found', message: 'Đăng ký không tồn tại.' });
    if (reg.status !== 'PENDING') {
      throw new BadRequestException({
        code: 'registration-not-pending',
        message: `Đăng ký có trạng thái '${reg.status}', không thể phê duyệt.`,
      });
    }

    const tenantSlug = slugify(reg.businessName);
    const branchSlug = tenantSlug + '-main';
    const rawToken = createHash('sha256').update(Date.now() + reg.email + Math.random().toString()).digest('hex');

    // Use a fresh random token (crypto.randomBytes better than hashing above)
    const { randomBytes } = await import('crypto');
    const finalRawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(finalRawToken).digest('hex');
    const inviteTokenExpiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_MS);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Tenant + initial branch
      const tenant = await tx.tenant.create({
        data: {
          name: reg.businessName,
          slug: tenantSlug,
          configuration: { create: { currency: 'VND', locale: 'vi-VN', timezone: 'Asia/Ho_Chi_Minh' } },
        },
      });

      const branch = await tx.branch.create({
        data: {
          name: reg.businessName,
          code: tenantSlug.substring(0, 20),
          slug: branchSlug,
          tenantId: tenant.id,
          isDefault: true,
          configuration: { create: {} },
        },
      });

      // 2. User (inactive — must activate via invite token)
      const user = await tx.user.create({
        data: {
          email: reg.email,
          passwordHash: '!',   // locked account marker; replaced on setup-password
          isActive: false,
          isSuperAdmin: false,
        },
      });

      // 3. TenantMembership (owner)
      await tx.tenantMembership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: 'owner',
        },
      });

      // 4. InviteToken
      await tx.inviteToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: inviteTokenExpiresAt,
        },
      });

      // 5. Update registration
      await this.registrationRepository.approveWithTx(tx, id, tenant.id, actorId);

      return { tenantId: tenant.id, branchId: branch.id, userId: user.id };
    });

    this.logger.log(JSON.stringify({
      action: 'registration.approve', registrationId: id,
      tenantId: result.tenantId, userId: result.userId, actorId,
    }));

    return {
      registrationId: id,
      tenantId: result.tenantId,
      userId: result.userId,
      rawInviteToken: finalRawToken,
      inviteTokenExpiresAt: inviteTokenExpiresAt.toISOString(),
    };
  }

  // ─── SA reject ────────────────────────────────────────────────────────────

  async reject(id: string, actorId: string, reviewNote: string): Promise<RejectRegistrationResponse> {
    const reg = await this.registrationRepository.findById(id);
    if (!reg) throw new NotFoundException({ code: 'registration-not-found', message: 'Đăng ký không tồn tại.' });
    if (reg.status !== 'PENDING') {
      throw new BadRequestException({
        code: 'registration-not-pending',
        message: `Đăng ký có trạng thái '${reg.status}', không thể từ chối.`,
      });
    }

    await this.registrationRepository.reject(id, actorId, reviewNote);
    this.logger.log(JSON.stringify({ action: 'registration.reject', registrationId: id, actorId }));

    return { registrationId: id, status: 'REJECTED' };
  }
}
