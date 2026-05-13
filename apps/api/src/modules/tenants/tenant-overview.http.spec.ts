import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import request from 'supertest';
import { createApp } from '../../main';

describe('Tenant overview API', () => {
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
        db: { url: process.env.DATABASE_URL },
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

  it('returns empty items array and zero count when no tenants exist', async () => {
    const response = await request(app.getHttpServer()).get('/api/tenants');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        totalTenants: 0,
        items: [],
      },
    });
  });

  it('returns overview with totalTenants count and items in standard envelope after provisioning', async () => {
    await request(app.getHttpServer())
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

    const response = await request(app.getHttpServer()).get('/api/tenants');

    expect(response.status).toBe(200);
    expect(response.body.data.totalTenants).toBe(1);
    expect(response.body.data.items).toHaveLength(1);

    const item = response.body.data.items[0];
    expect(item).toMatchObject({
      tenantId: expect.any(String),
      name: 'Blue Coral Retail',
      slug: 'blue-coral-retail',
      createdAt: expect.any(String),
    });
    expect(item.defaultBranch).toMatchObject({
      branchId: expect.any(String),
      name: 'Chi nhanh Quan 1',
      slug: 'chi-nhanh-quan-1',
      code: 'Q1',
      readinessStatus: expect.any(String),
    });
  });

  it('returns stable items array (not null) even with no tenants', async () => {
    const response = await request(app.getHttpServer()).get('/api/tenants');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('does not expose Prisma internal fields or audit payload in overview items', async () => {
    await request(app.getHttpServer())
      .post('/api/tenants/provisioning')
      .send({
        actorId: 'system-admin',
        tenantName: 'Audit Test Tenant',
        tenantSlug: 'audit-test-tenant',
        branchName: 'Test Branch',
        branchSlug: 'test-branch',
        branchCode: 'TB1',
        locale: 'vi-VN',
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
      });

    const response = await request(app.getHttpServer()).get('/api/tenants');

    const item = response.body.data.items[0];
    expect(item).not.toHaveProperty('actorId');
    expect(item).not.toHaveProperty('configuration');
    expect(item).not.toHaveProperty('updatedAt');
    expect(item.defaultBranch).not.toHaveProperty('tenantId');
  });
});
