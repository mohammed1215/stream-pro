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

describe('Comments incl. replyCount (e2e)', () => {
  let app: any;
  let prisma: any;
  let server: any;
  let ownerToken: string;
  let replierToken: string;
  let videoId: string;
  let parentId: string;
  let replyId: string;

  beforeAll(async () => {
    ({ app, prisma, server } = await createTestApp());
    await cleanDatabase(prisma);

    const owner = await registerTestUser(server, 'commentowner');
    const replier = await registerTestUser(server, 'commentreplier');
    expect(owner.res.status).toBe(201);
    expect(replier.res.status).toBe(201);
    ownerToken = owner.res.body.data.accessToken;
    replierToken = replier.res.body.data.accessToken;

    expect((await createChannel(server, ownerToken)).status).toBe(201);
    const category = await createCategory(prisma, 'comments');
    const video = await initiateVideo(server, ownerToken, {
      title: 'Comment target',
      description: 'e2e comments',
      categoryId: category.id,
    });
    expect(video.status).toBe(201);
    videoId = video.body.data.videoId;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  it('creates a top-level comment', async () => {
    const res = await request(server)
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', bearer(ownerToken))
      .send({ content: 'first!' });
    expect(res.status).toBe(201);
    expect(typeof res.body.commentId).toBe('string');
    parentId = res.body.commentId;
  });

  it('increments replyCount when ANOTHER user replies (original bug)', async () => {
    const res = await request(server)
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', bearer(replierToken))
      .send({ content: 'a reply', parentId });
    expect(res.status).toBe(201);
    replyId = res.body.commentId;

    const list = await request(server).get(
      `/api/v1/comments/${videoId}?page=1&limit=10`,
    );
    expect(list.status).toBe(200);
    const parent = list.body.items.find((c: any) => c.commentId === parentId);
    expect(parent).toBeDefined();
    expect(parent.replyCount).toBe(1);
  });

  it('lists the reply', async () => {
    const res = await request(server).get(
      `/api/v1/comments/${parentId}/replies`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].commentId).toBe(replyId);
  });

  it('rejects replying to a reply with 400', async () => {
    const res = await request(server)
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', bearer(ownerToken))
      .send({ content: 'nested?', parentId: replyId });
    expect(res.status).toBe(400);
  });

  it('decrements replyCount when the reply is deleted', async () => {
    const del = await request(server)
      .delete(`/api/v1/comments/${replyId}`)
      .set('Authorization', bearer(replierToken));
    expect(del.status).toBe(200);

    const list = await request(server).get(
      `/api/v1/comments/${videoId}?page=1&limit=10`,
    );
    const parent = list.body.items.find((c: any) => c.commentId === parentId);
    expect(parent.replyCount).toBe(0);
  });

  it('rejects unauthenticated comment creation', async () => {
    const res = await request(server)
      .post(`/api/v1/comments/${videoId}`)
      .send({ content: 'nope' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
