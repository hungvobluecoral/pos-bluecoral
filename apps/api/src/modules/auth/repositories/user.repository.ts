import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  isSuperAdmin: boolean;
  isActive: boolean;
}

export interface BranchMembershipRecord {
  tenantId: string;
  branchId: string;
  branchName: string;
  role: string;
}

export interface TenantMembershipRecord {
  tenantId: string;
  role: string;
}

export interface UserWithMemberships extends UserRecord {
  tenantMembership: TenantMembershipRecord | null;
  branchMemberships: BranchMembershipRecord[];
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailWithMemberships(email: string): Promise<UserWithMemberships | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isSuperAdmin: true,
        isActive: true,
        tenantMemberships: {
          select: { tenantId: true, role: true },
          take: 1,
        },
        branchMemberships: {
          select: {
            tenantId: true,
            branchId: true,
            role: true,
            branch: { select: { name: true } },
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      isSuperAdmin: user.isSuperAdmin,
      isActive: user.isActive,
      tenantMembership: user.tenantMemberships[0]
        ? { tenantId: user.tenantMemberships[0].tenantId, role: user.tenantMemberships[0].role }
        : null,
      branchMemberships: user.branchMemberships.map((bm) => ({
        tenantId: bm.tenantId,
        branchId: bm.branchId,
        branchName: bm.branch.name,
        role: bm.role,
      })),
    };
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isSuperAdmin: true,
        isActive: true,
      },
    });
  }

  async findByIdWithTenantMembership(id: string): Promise<(UserRecord & { tenantMembership: TenantMembershipRecord | null }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isSuperAdmin: true,
        isActive: true,
        tenantMemberships: {
          select: { tenantId: true, role: true },
          take: 1,
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      isSuperAdmin: user.isSuperAdmin,
      isActive: user.isActive,
      tenantMembership: user.tenantMemberships[0]
        ? { tenantId: user.tenantMemberships[0].tenantId, role: user.tenantMemberships[0].role }
        : null,
    };
  }

  async findBranchMembership(userId: string, branchId: string): Promise<BranchMembershipRecord | null> {
    const bm = await this.prisma.branchMembership.findUnique({
      where: { userId_branchId: { userId, branchId } },
      select: {
        tenantId: true,
        branchId: true,
        role: true,
        branch: { select: { name: true } },
      },
    });

    if (!bm) return null;
    return { tenantId: bm.tenantId, branchId: bm.branchId, branchName: bm.branch.name, role: bm.role };
  }

  async activateWithPassword(userId: string, passwordHash: string): Promise<UserRecord> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, isActive: true },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isSuperAdmin: true,
        isActive: true,
      },
    });
  }

  async branchBelongsToTenant(branchId: string, tenantId: string): Promise<boolean> {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenantId },
      select: { id: true },
    });
    return branch !== null;
  }
}
