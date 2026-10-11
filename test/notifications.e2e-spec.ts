import request from 'supertest';
import {
  bearer,
  cleanDatabase,
  createCategory,
  createChannel,
  createTestApp,
  initiateVideo,
  registerTestUser,
  waitFor,
} from './helpers/e2e-setup';

jest.setTimeout(60000);

describe('Notifications incl. REPLY (e2e)', () => {
  let app: any;
  let prisma: any;
  let server: any;
  let ownerToken: string;
  let viewerToken: string;
  let videoId: string;

  beforeAll(async () => {
    ({ app, prisma, server } = await createTestApp());
    await cleanDatabase(prisma);

    const owner = await registerTestUser(server, 'notifowner');
    const viewer = await registerTestUser(server, 'notifviewer');
    expect(owner.res.status).toBe(201);
    expect(viewer.res.status).toBe(201);
    ownerToken = owner.res.body.data.accessToken;
    viewerToken = viewer.res.body.data.accessToken;

    expect((await createChannel(server, ownerToken)).status).toBe(201);
    const category = await createCategory(prisma, 'notifs');
    const video = await initiateVideo(server, ownerToken, {
      title: 'Notif target',
      description: 'e2e notifications',
      categoryId: category.id,
    });
    expect(video.status).toBe(201);
    videoId = video.body.data.videoId;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  async function fetchNotifications(token: string) {
    const res = await request(server)
      .get('/api/v1/notifications?pageNumber=1&pageSize=10')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    return res.body;
  }

  it('creates a COMMENT notification for the channel owner', async () => {
    const comment = await request(server)
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', bearer(viewerToken))
      .send({ content: 'nice video!' });
    expect(comment.status).toBe(201);

    // Notification creation is fire-and-forget on the backend, so poll.
    const body = await waitFor(async () => {
      const data = await fetchNotifications(ownerToken);
      const found = data.items.find((n: any) => n.type === 'COMMENT');
      return found ? data : null;
    });
    expect(
      body.items.find((n: any) => n.type === 'COMMENT'),
    ).toBeDefined();
    expect(body.unreadTotal).toBeGreaterThan(0);
  });

  it('creates a REPLY notification for the parent comment author', async () => {
    const list = await request(server).get(
      `/api/v1/comments/${videoId}?page=1&limit=10`,
    );
    const parent = list.body.items.find(
      (c: any) => c.content === 'nice video!',
    );
    expect(parent).toBeDefined();

    const reply = await request(server)
      .post(`/api/v1/comments/${videoId}`)
      .set('Authorization', bearer(ownerToken))
      .send({ content: 'thanks!', parentId: parent.commentId });
    expect(reply.status).toBe(201);

    const body = await waitFor(async () => {
      const data = await fetchNotifications(viewerToken);
      const found = data.items.find((n: any) => n.type === 'REPLY');
      return found ? data : null;
    });
    expect(
      body.items.find((n: any) => n.type === 'REPLY'),
    ).toBeDefined();
  });

  it('marks a notification as read and clears the unread count', async () => {
    const before = await fetchNotifications(viewerToken);
    expect(before.unreadTotal).toBeGreaterThan(0);
    const target = before.items.find((n: any) => !n.isRead);
    expect(target).toBeDefined();

    const marked = await request(server)
      .patch(`/api/v1/notifications/${target.notificationId}`)
      .set('Authorization', bearer(viewerToken));
    expect(marked.status).toBe(200);
    expect(marked.body.isRead).toBe(true);

    const all = await request(server)
      .patch('/api/v1/notifications')
      .set('Authorization', bearer(viewerToken));
    expect(all.status).toBe(200);

    const after = await fetchNotifications(viewerToken);
    expect(after.unreadTotal).toBe(0);
  });
});
