import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookie from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { FirebaseService } from '../../src/firebase/firbase.service';

/**
 * Ensures the env vars required by ConfigModule validation exist.
 * Real values from `.env` are kept; only missing ones get harmless dummies.
 * Firebase is stubbed via provider override below, so no real credentials
 * are needed (tests never register device tokens, so no push is ever sent).
 */
export function ensureTestEnv() {
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Point it (or DATABASE_URL_TEST) at an empty Postgres test database.',
    );
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!/test/i.test(dbUrl) && process.env.ALLOW_E2E_WIPE !== 'true') {
    throw new Error(
      `Refusing to run E2E tests against a non-test database (${maskDb(dbUrl)}). ` +
        `Use a database with "test" in its URL or set ALLOW_E2E_WIPE=true.`,
    );
  }

  process.env.NODE_ENV ??= 'test';
  process.env.JWT_ACCESS_TOKEN_SECRET ??=
    'e2e-test-secret-that-is-long-enough-32-chars';
  process.env.CLOUDINARY_API_KEY ??= 'test-key';
  process.env.CLOUDINARY_API_SECRET ??= 'test-secret';
  process.env.CLOUDINARY_CLOUD_NAME ??= 'test-cloud';
  process.env.FIREBASE_SERVICE_ACCOUNT ??= '{}';
  process.env.ALLOWED_ORIGINS ??= 'http://localhost:5173';
  process.env.UPSTASH_REDIS_REST_URL ??= 'https://test.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN ??= 'test-token';
  process.env.QSTASH_TOKEN ??= 'test-qstash-token';
}

function maskDb(url: string) {
  return url.replace(/:\/\/[^@]+@/, '://***@');
}

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
  server: any;
}> {
  ensureTestEnv();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(FirebaseService)
    .useValue({ sendPushNotification: async () => ({ success: true }) })
    .compile();

  const app = moduleFixture.createNestApplication();
  // Mirror main.ts so routes behave exactly like production.
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(cookie());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();

  const prisma = app.get(PrismaService);
  return { app, prisma, server: app.getHttpServer() };
}

/** Wipes all business data. Requires a test database (see ensureTestEnv). */
export async function cleanDatabase(prisma: PrismaService) {
  const db: any = prisma;
  // Child tables first (Comment is self-referencing; deleteMany handles it).
  for (const model of [
    'refreshToken',
    'notification',
    'searchQuery',
    'download',
    'watchHistory',
    'watchLater',
    'subscription',
    'like',
    'comment',
    'playlistVideo',
    'playlist',
    'video',
    'channel',
    'category',
    'tag',
    'user',
  ]) {
    if (db[model]) await db[model].deleteMany();
  }
}

// ---------------------------------------------------------------------------
// Flow helpers
// ---------------------------------------------------------------------------

export const STRONG_PASSWORD = 'Str0ng!Pass123';

export const uniqueEmail = (tag: string) =>
  `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

export async function registerTestUser(
  server: any,
  tag: string,
  overrides: Record<string, unknown> = {},
) {
  const payload = {
    name: `E2E ${tag}`,
    email: uniqueEmail(tag),
    password: STRONG_PASSWORD,
    ...overrides,
  };
  const res = await request(server)
    .post('/api/v1/auth/register')
    .send(payload);
  return { res, payload };
}

export const bearer = (token: string) => `Bearer ${token}`;

export async function createChannel(server: any, token: string) {
  const res = await request(server)
    .post('/api/v1/owner/channels')
    .set('Authorization', bearer(token))
    .send();
  return res;
}

export async function createCategory(prisma: PrismaService, tag: string) {
  const db: any = prisma;
  return db.category.create({ data: { name: `e2e-cat-${tag}-${Date.now()}` } });
}

export async function initiateVideo(
  server: any,
  token: string,
  body: Record<string, unknown>,
) {
  return request(server)
    .post('/api/v1/owner/videos/initiate')
    .set('Authorization', bearer(token))
    .send(body);
}

/** Polls until `fn` returns a truthy value or the timeout expires. */
export async function waitFor<T>(
  fn: () => Promise<T | null | undefined>,
  timeoutMs = 8000,
  intervalMs = 250,
): Promise<T> {
  const start = Date.now();
  // biome-ignore lint/noConstantCondition: polling loop
  while (true) {
    const result = await fn();
    if (result) return result;
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitFor timed out waiting for expected condition');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
