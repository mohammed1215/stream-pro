import request from 'supertest';
import {
  bearer,
  cleanDatabase,
  createCategory,
  createChannel,
  createTestApp,
  initiateVideo,
  registerTestUser,
} from './helpers/e2e-setup';

jest.setTimeout(30000);

describe('Owner videos incl. tags (e2e)', () => {
  let app: any;
  let prisma: any;
  let server: any;
  let token: string;
  let categoryId: string;
  let videoId: string;

  beforeAll(async () => {
    ({ app, prisma, server } = await createTestApp());
    await cleanDatabase(prisma);

    const { res } = await registerTestUser(server, 'videowner');
    expect(res.status).toBe(201);
    token = res.body.data.accessToken;

    const channel = await createChannel(server, token);
    expect(channel.status).toBe(201);

    const category = await createCategory(prisma, 'vids');
    categoryId = category.id;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  it('initiates a video with tags', async () => {
    const res = await initiateVideo(server, token, {
      title: 'E2E video',
      description: 'created by e2e',
      categoryId,
      tags: ['NestJS', 'Tutorial'],
    });
    expect(res.status).toBe(201);
    expect(typeof res.body.data.videoId).toBe('string');
    videoId = res.body.data.videoId;
  });

  it('returns tags as {id,name} objects in owner details (tags-display regression)', async () => {
    const res = await request(server)
      .get(`/api/v1/owner/videos/${videoId}`)
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(res.body.tags).toHaveLength(2);
    for (const tag of res.body.tags) {
      expect(tag).toHaveProperty('id');
      expect(tag).toHaveProperty('name');
    }
    const names = res.body.tags.map((t: any) => t.name).sort();
    expect(names).toEqual(['nestjs', 'tutorial']);
  });

  it('updates tags via PATCH and returns objects', async () => {
    const res = await request(server)
      .patch(`/api/v1/owner/videos/${videoId}`)
      .set('Authorization', bearer(token))
      .send({ title: 'E2E video (edited)', tags: ['updated', 'e2e'] });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/success/i);
    const names = res.body.video.tags.map((t: any) => t.name).sort();
    expect(names).toEqual(['e2e', 'updated']);

    const fresh = await request(server)
      .get(`/api/v1/owner/videos/${videoId}`)
      .set('Authorization', bearer(token));
    expect(
      fresh.body.tags.map((t: any) => t.name).sort(),
    ).toEqual(['e2e', 'updated']);
  });

  it('rejects more than 10 tags with 400', async () => {
    const res = await request(server)
      .patch(`/api/v1/owner/videos/${videoId}`)
      .set('Authorization', bearer(token))
      .send({ tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) });
    expect(res.status).toBe(400);
  });

  it('likes and unlikes the video', async () => {
    const like = await request(server)
      .post(`/api/v1/likes/${videoId}`)
      .set('Authorization', bearer(token));
    expect(like.status).toBe(201);

    const unlike = await request(server)
      .delete(`/api/v1/likes/${videoId}`)
      .set('Authorization', bearer(token));
    expect(unlike.status).toBe(200);
  });

  it('rejects unauthenticated owner-details access', async () => {
    const res = await request(server).get(`/api/v1/owner/videos/${videoId}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
