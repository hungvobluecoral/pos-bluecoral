import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';

const mockPrisma = {
  $transaction: jest.fn(),
};

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findPendingByEmail: jest.fn(),
  listByStatus: jest.fn(),
  approveWithTx: jest.fn(),
  reject: jest.fn(),
};

describe('RegistrationsService', () => {
  let service: RegistrationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RegistrationsService(mockPrisma as any, mockRepo as any);
  });

  // ─── submit ──────────────────────────────────────────────────────────────

  describe('submit()', () => {
    const payload = { name: 'Alice', email: 'alice@shop.vn', businessName: 'Shop A' };

    it('creates registration when no pending entry for email', async () => {
      mockRepo.findPendingByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({
        id: 'reg-1',
        ...payload,
        status: 'PENDING',
        reviewNote: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: null,
        reviewedBy: null,
        reviewedAt: null,
      });

      const result = await service.submit(payload);
      expect(result.status).toBe('PENDING');
      expect(result.registrationId).toBe('reg-1');
      expect(mockRepo.create).toHaveBeenCalledWith(payload);
    });

    it('throws ConflictException when PENDING registration already exists for email', async () => {
      mockRepo.findPendingByEmail.mockResolvedValue({ id: 'reg-0', status: 'PENDING' });

      await expect(service.submit(payload)).rejects.toBeInstanceOf(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── list ─────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('returns items without status filter', async () => {
      const rows = [
        { id: 'r1', name: 'A', email: 'a@b.c', businessName: 'B', status: 'PENDING', reviewNote: null, createdAt: new Date() },
      ];
      mockRepo.listByStatus.mockResolvedValue(rows);

      const result = await service.list();
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe('r1');
      expect(mockRepo.listByStatus).toHaveBeenCalledWith(undefined);
    });

    it('passes status filter to repository', async () => {
      mockRepo.listByStatus.mockResolvedValue([]);
      await service.list('APPROVED');
      expect(mockRepo.listByStatus).toHaveBeenCalledWith('APPROVED');
    });
  });

  // ─── approve ──────────────────────────────────────────────────────────────

  describe('approve()', () => {
    const pendingReg = {
      id: 'reg-1',
      name: 'Alice',
      email: 'alice@shop.vn',
      businessName: 'Shop A',
      status: 'PENDING',
      tenantId: null,
      reviewNote: null,
      createdAt: new Date(),
    };

    it('throws NotFoundException when registration does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.approve('reg-1', 'sa-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when registration is not PENDING', async () => {
      mockRepo.findById.mockResolvedValue({ ...pendingReg, status: 'APPROVED' });
      await expect(service.approve('reg-1', 'sa-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('runs transaction and returns rawInviteToken on success', async () => {
      mockRepo.findById.mockResolvedValue(pendingReg);
      const txResult = { tenantId: 'tenant-1', branchId: 'branch-1', userId: 'user-1' };
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn({
        tenant: { create: jest.fn().mockResolvedValue({ id: 'tenant-1' }) },
        branch: { create: jest.fn().mockResolvedValue({ id: 'branch-1' }) },
        user: { create: jest.fn().mockResolvedValue({ id: 'user-1' }) },
        tenantMembership: { create: jest.fn() },
        inviteToken: { create: jest.fn() },
      }));

      const result = await service.approve('reg-1', 'sa-1');
      expect(result.rawInviteToken).toBeDefined();
      expect(result.rawInviteToken.length).toBe(64); // 32 bytes hex
      expect(result.inviteTokenExpiresAt).toBeDefined();
    });
  });

  // ─── reject ───────────────────────────────────────────────────────────────

  describe('reject()', () => {
    const pendingReg = {
      id: 'reg-1',
      name: 'Alice',
      email: 'alice@shop.vn',
      businessName: 'Shop A',
      status: 'PENDING',
      tenantId: null,
      reviewNote: null,
      createdAt: new Date(),
    };

    it('throws NotFoundException when registration does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.reject('reg-1', 'sa-1', 'bad info')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when already resolved', async () => {
      mockRepo.findById.mockResolvedValue({ ...pendingReg, status: 'REJECTED' });
      await expect(service.reject('reg-1', 'sa-1', 'bad info')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('calls repository reject with correct args', async () => {
      mockRepo.findById.mockResolvedValue(pendingReg);
      mockRepo.reject.mockResolvedValue({ ...pendingReg, status: 'REJECTED', reviewNote: 'bad info' });

      const result = await service.reject('reg-1', 'sa-1', 'bad info');
      expect(result.status).toBe('REJECTED');
      expect(mockRepo.reject).toHaveBeenCalledWith('reg-1', 'sa-1', 'bad info');
    });
  });
});
