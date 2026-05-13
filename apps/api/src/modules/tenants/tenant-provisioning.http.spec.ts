import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import request from 'supertest';
import { createApp } from '../../main';

describe('Tenant provisioning API', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@127.0.0.1:5432/pos_bluecoral?schema=public';
    const repoRoot = path.resolve(process.cwd(), '../..');

    execSync('docker compose -f docker-compose.dev.yml up -d postgres', {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    execSync(
      "bash -lc \"until docker inspect -f '{{.State.Health.Status}}' pos-bluecoral-postgres 2>/dev/null | grep -q healthy; do sleep 2; done\"",
      {
        cwd: repoRoot,
        stdio: 'ignore',
      },
    );
    execSync('pnpm prisma migrate deploy --schema apps/api/prisma/schema.prisma', {
      cwd: repoRoot,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdio: 'ignore',
    });

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    app = await createApp();
    await app.init();
  });

  beforeEach(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.branchConfiguration.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.tenantConfiguration.deleteMany();
    await prisma.tenant.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('creates a tenant and its first branch in a standardized success envelope', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tenants/provisioning')
      .send({
        actorId: 'system-admin',
        tenantName: 'Blue Coral Retail',
        tenantSlug: 'blue-coral-retail',
        branchName: 'Chi nhanh Quan 1',
        branchSlug: 'chi-nhanh-quan-1',
        branchCode: 'Q1',
        locale: 'vi-VN',
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: {
        tenantId: expect.any(String),
        branchId: expect.any(String),
        tenant: {
          name: 'Blue Coral Retail',
          slug: 'blue-coral-retail',
        },
        branch: {
          name: 'Chi nhanh Quan 1',
          slug: 'chi-nhanh-quan-1',
          code: 'Q1',
        },
      },
      meta: {
        requestId: expect.any(String),
        scope: 'system-admin',
      },
    });

    const auditLog = await prisma.auditLog.findFirstOrThrow({
      where: {
        outcome: 'success',
        requestId: response.body.meta.requestId,
      },
    });

    expect(auditLog).toMatchObject({
      action: 'tenant.provisioning',
      actorId: 'system-admin',
      branchId: response.body.data.branchId,
      tenantId: response.body.data.tenantId,
    });
  });

  it('returns a stable validation error envelope with requestId for invalid payloads', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tenants/provisioning')
      .send({
        actorId: '',
        tenantName: '',
        tenantSlug: 'invalid slug',
        branchName: '',
        branchSlug: '',
        branchCode: '',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: 'validation-failed',
        message: expect.any(String),
        requestId: expect.any(String),
        details: expect.anything(),
      },
    });

    const auditLog = await prisma.auditLog.findFirstOrThrow({
      where: {
        outcome: 'failure',
        requestId: response.body.error.requestId,
      },
    });

    expect(auditLog).toMatchObject({
      action: 'tenant.provisioning',
      actorId: '',
    });
  });

  it('returns a stable conflict error when tenant or branch identifiers already exist', async () => {
    const payload = {
      actorId: 'system-admin',
      tenantName: 'Blue Coral Retail Conflict',
      tenantSlug: 'blue-coral-retail-conflict',
      branchName: 'Chi nhanh District 7',
      branchSlug: 'district-7',
      branchCode: 'D7',
      locale: 'vi-VN',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
    };

    await request(app.getHttpServer()).post('/api/tenants/provisioning').send(payload);

    const response = await request(app.getHttpServer())
      .post('/api/tenants/provisioning')
      .send(payload);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: {
        code: 'tenant-already-exists',
        message: expect.any(String),
        requestId: expect.any(String),
      },
    });
  });

  it('rejects provisioning when the request arrives with an unexpected tenant scope header', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tenants/provisioning')
      .set('x-tenant-id', 'tenant-existing-scope')
      .send({
        actorId: 'system-admin',
        tenantName: 'Scoped Tenant',
        tenantSlug: 'scoped-tenant',
        branchName: 'Scoped Branch',
        branchSlug: 'scoped-branch',
        branchCode: 'SB1',
        locale: 'vi-VN',
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
      });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: {
        code: 'scope-mismatch',
        message: expect.any(String),
        requestId: expect.any(String),
      },
    });
  });
});
