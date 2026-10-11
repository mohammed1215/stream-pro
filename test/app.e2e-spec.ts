import request from 'supertest';
import { cleanDatabase, createTestApp } from './helpers/e2e-setup';

jest.setTimeout(30000);

describe('App health (e2e)', () => {
  let app: any;
  let prisma: any;
  let server: any;

  beforeAll(async () => {
    ({ app, prisma, server } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1 (GET) responds', async () => {
    const res = await request(server).get('/api/v1/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello World!');
  });

  it('database is reachable', async () => {
    await expect(
      (prisma as any).user.count(),
    ).resolves.toEqual(expect.any(Number));
    await cleanDatabase(prisma);
  });
});
