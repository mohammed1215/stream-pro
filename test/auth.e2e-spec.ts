import request from 'supertest';
import {
  bearer,
  cleanDatabase,
  createChannel,
  createTestApp,
  registerTestUser,
  STRONG_PASSWORD,
} from './helpers/e2e-setup';

jest.setTimeout(30000);

describe('Auth (e2e)', () => {
  let app: any;
  let prisma: any;
  let server: any;

  beforeAll(async () => {
    ({ app, prisma, server } = await createTestApp());
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  it('registers a new user', async () => {
    const { res, payload } = await registerTestUser(server, 'register');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.accessToken).toBe('string');
    expect(res.body.data.user.email).toBe(payload.email);
  });

  it('rejects duplicate email with 409', async () => {
    const { payload } = await registerTestUser(server, 'dupe');
    const again = await request(server)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dupe Again',
        email: payload.email,
        password: STRONG_PASSWORD,
      });
    expect(again.status).toBe(409);
  });

  it('rejects weak password with 400', async () => {
    const res = await request(server).post('/api/v1/auth/register').send({
      name: 'Weak',
      email: `weak-${Date.now()}@example.com`,
      password: '123',
    });
    expect(res.status).toBe(400);
  });

  it('logs in and accesses the profile', async () => {
    const { payload } = await registerTestUser(server, 'login');
    const login = await request(server).post('/api/v1/auth/login').send({
      email: payload.email,
      password: STRONG_PASSWORD,
    });
    expect(login.status).toBe(201);
    const token = login.body.data.accessToken as string;
    expect(typeof token).toBe('string');

    // NOTE: profile/me requires a channel (backend throws 404 otherwise),
    // so create one first.
    const channel = await createChannel(server, token);
    expect(channel.status).toBe(201);

    const me = await request(server)
      .get('/api/v1/profile/me')
      .set('Authorization', bearer(token));
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(payload.email);
  });

  it('rejects wrong password with 401', async () => {
    const { payload } = await registerTestUser(server, 'wrongpass');
    const login = await request(server).post('/api/v1/auth/login').send({
      email: payload.email,
      password: 'Wr0ng!Pass999',
    });
    expect(login.status).toBe(401);
  });

  it('rejects profile access without token', async () => {
    const me = await request(server).get('/api/v1/profile/me');
    expect(me.status).toBeGreaterThanOrEqual(400);
  });
});
