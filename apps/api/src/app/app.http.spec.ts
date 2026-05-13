import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../main';

describe('API foundation smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('publishes swagger json under the prefixed docs route', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs-json');

    expect(response.status).toBe(200);
    expect(response.body.info).toMatchObject({
      title: 'POS_BlueCoral API',
      version: '1.0.0',
    });
  });

  it('returns the standardized error envelope with a request id', async () => {
    const response = await request(app.getHttpServer()).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: {
        code: 'notFound',
        message: 'Resource not found',
      },
    });
    expect(response.body.error.requestId).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });
});
