import { Injectable } from '@nestjs/common';
import { RegistrationStatus } from '@pos-bluecoral/contracts';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface RegistrationRecord {
  id: string;
  tenantId: string | null;
  email: string;
  name: string;
  businessName: string;
  status: RegistrationStatus;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; email: string; businessName: string }): Promise<RegistrationRecord> {
    return this.prisma.tenantRegistration.create({
      data: {
        name: data.name,
        email: data.email,
        businessName: data.businessName,
      },
    }) as unknown as Promise<RegistrationRecord>;
  }

  async findById(id: string): Promise<RegistrationRecord | null> {
    return this.prisma.tenantRegistration.findUnique({
      where: { id },
    }) as unknown as Promise<RegistrationRecord | null>;
  }

  async findPendingByEmail(email: string): Promise<RegistrationRecord | null> {
    return this.prisma.tenantRegistration.findFirst({
      where: { email, status: 'PENDING' },
    }) as unknown as Promise<RegistrationRecord | null>;
  }

  async listByStatus(status?: RegistrationStatus): Promise<RegistrationRecord[]> {
    return this.prisma.tenantRegistration.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<RegistrationRecord[]>;
  }

  async approveWithTx(
    tx: Prisma.TransactionClient,
    id: string,
    tenantId: string,
    reviewedBy: string,
  ): Promise<void> {
    await tx.tenantRegistration.update({
      where: { id },
      data: {
        status: 'APPROVED',
        tenantId,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async reject(id: string, reviewedBy: string, reviewNote: string): Promise<RegistrationRecord> {
    return this.prisma.tenantRegistration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
        reviewNote,
      },
    }) as unknown as Promise<RegistrationRecord>;
  }
}
