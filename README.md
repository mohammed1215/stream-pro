# Stream Pro — Backend

A full-stack video streaming platform backend (YouTube-like), built with **NestJS**, **Prisma**, and **PostgreSQL**. Video processing is handled through **Cloudinary** (signed direct uploads + HLS adaptive bitrate streaming), with **Redis (Upstash)** used for view-count throttling and **Firebase Cloud Messaging** for push notifications.

---

## ✨ Features

- **Auth** — email/password + Google OAuth, JWT access tokens, refresh token rotation with hashed storage, multi-device session tracking (`deviceId` / `deviceToken` / `deviceType`), active session listing & revocation, logout / logout-all
- **Channels** — create/update channel, avatar & thumbnail uploads, channel home (videos + playlists), public channel details with subscriber/view counts
- **Videos** — signed direct-to-Cloudinary upload flow (video + thumbnail), async HLS transcoding via Cloudinary eager transformations + webhook status updates, publish/unpublish, soft delete, owner vs. public views
- **Categories & Tags** — admin-managed categories, many-to-many tags with `findOrCreate` + autocomplete search
- **Recommendations** — weighted hybrid scoring in `getRelatedVideos` (same channel, co-watched by other viewers, shared tags, same category)
- **Search** — full-text video search (title/description) with category filtering and pagination
- **View Counting** — Redis-backed throttling so repeat views from the same viewer (user or hashed IP+UA for guests) don't inflate counts within a TTL window
- **Playlists** — create/update, public/private, add/remove/reorder videos (transactional), cursor-based video listing
- **Watch History** — progress tracking (clamped to video duration), grouped by Today / Yesterday / Last 7 Days / Last 30 Days / Older
- **Watch Later** — add/remove, status check, cursor-paginated list
- **Subscriptions** — subscribe/unsubscribe, owner subscriber list, cursor-paginated "my subscriptions" feed
- **Comments** — paginated, sortable, edit/delete with ownership checks
- **Likes** — like/unlike videos, cursor-paginated liked-videos list
- **Notifications** — in-app notifications (like/comment/playlist/subscription) + push via FCM, with automatic stale-token cleanup on delivery failure
- **Home Feed** — trending / latest / subscription-based sections
- **Rate Limiting** — global throttling via `@nestjs/throttler` (short + medium windows)
- **Validation** — environment variables validated at boot with Joi

---

## 🛠 Tech Stack

| Layer              | Technology                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Framework          | [NestJS](https://nestjs.com/)                                                                                       |
| ORM                | [Prisma](https://www.prisma.io/) (`@prisma/adapter-pg`)                                                             |
| Database           | PostgreSQL (hosted on [Neon](https://neon.tech))                                                                    |
| Caching/Throttle   | [Upstash Redis](https://upstash.com/) (`@upstash/redis`)                                                            |
| Media Storage      | [Cloudinary](https://cloudinary.com/) (signed uploads, HLS via `full_hd` streaming profile + eager transformations) |
| Auth               | JWT (`@nestjs/jwt`), Google OAuth (`google-auth-library`), `cookie-parser`, `bcrypt`                                |
| Push Notifications | Firebase Admin SDK (FCM)                                                                                            |
| Video Metadata     | `music-metadata` (duration extraction)                                                                              |
| Env Validation     | `joi`                                                                                                               |
| Deployment         | Vercel (serverless) and/or Docker                                                                                   |
| API Docs           | `@nestjs/swagger` (with plugin metadata generation for return-type reflection)                                      |

---

## 🏗 Architecture

Strict **layered architecture**:

```
Controller → Service → Repository → Prisma
```

- **Controllers** — HTTP layer, DTO validation, split into `owner/` (authenticated channel-owner actions) and `public/` where relevant (e.g. videos).
- **Services** — business logic, orchestration between repositories, notifications, and external services (Cloudinary, Redis, Firebase).
- **Repositories** — Prisma queries only, using generic `select`/`include` shapes so callers get precisely-typed results.

### Project Structure

```
prisma/
├── schema.prisma
├── migrations/
└── seed.ts

src/
├── auth (in user/)      # AuthGuard, OptionalAuthGuard, JWT + Google OAuth, refresh token rotation
├── categories/          # Admin-managed categories + search
├── channel/             # Channel CRUD, home, videos, playlists
├── cloudinary/          # Signed uploads, HLS eager transforms, webhook signature verification
├── comments/            # Threaded comments per video
├── config/              # env.validation.ts (Joi schema)
├── decorators/          # @User, @Channel, ApiSuccessResponse
├── firebase/            # FCM push notification sending
├── home/                # Trending / Latest / Subscriptions feed
├── interceptors/        # ChannelPreloadInterceptor, LoggerInterceptor
├── likes/               # Like/unlike + liked-videos list
├── notifications/       # In-app + push notifications, stale token cleanup
├── playlists/           # CRUD, add/remove/reorder videos, cursor pagination
├── prisma/              # PrismaService (pg adapter)
├── redis/               # Upstash Redis client, view-throttling
├── subscriptions/       # Subscribe/unsubscribe, feeds
├── tags/                # findOrCreate tags, per-video tag resolution
├── user/                # Registration, login, profile, sessions
├── video-processing/    # Duration extraction via music-metadata
├── videos/
│   ├── owner/           # Owner-only video management endpoints
│   ├── public/          # Public search, details, related videos, view recording
│   └── repositories/    # Video select shapes + recommendation scoring logic
├── watch-history/       # Progress tracking, grouped history
├── watchlater/          # Save/remove/check watch-later status
├── webhooks/            # Cloudinary upload-completion webhook
├── main.ts              # Local bootstrap
└── vercel.ts            # Serverless bootstrap (Express adapter)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- PostgreSQL database (e.g. a free [Neon](https://neon.tech) instance)
- Cloudinary account
- Firebase project with a service account (for FCM)
- Upstash Redis database

### Installation

```bash
git clone https://github.com/<your-username>/stream-pro-backend.git
cd stream-pro-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root (and keep a matching `.env.example` with placeholder values checked into the repo):

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT
JWT_ACCESS_TOKEN_SECRET="a-long-random-secret-at-least-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_EAGER_NOTIFICATION_URL="https://your-api.com/api/webhooks/cloudinary"

# Firebase (FCM) — full service account JSON as a single-line string
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

# CORS
ALLOWED_ORIGINS="http://localhost:5173,https://your-frontend-domain.com"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

> ⚠️ Never commit your `.env` file — make sure it's in `.gitignore`. Environment variables are validated at startup via a Joi schema (`src/config/env.validation.ts`); the app will refuse to boot if a required variable is missing or malformed.

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Running the App

```bash
# development (watch mode)
npm run start:dev

# production build
npm run build
npm run start:prod
```

The API is available at `http://localhost:3001/api` (global prefix `api`, URI versioning `v1`), with Swagger docs at `/api/docs`.

### Running with Docker

A `Dockerfile` and `entrypoint.sh` are included for containerized deployment (e.g. running migrations on container start before launching the app).

---

## ☁️ Deployment

### Vercel (serverless)

The app has a dedicated serverless entrypoint (`src/vercel.ts`) using the Express adapter with a cached Nest app instance across invocations. Build command must run migrations before building:

```bash
prisma generate && prisma migrate deploy && nest build
```

> `prisma migrate dev` is for local development only — always use `prisma migrate deploy` in production/CI. If the database schema was changed manually outside of Prisma, run `prisma migrate resolve --applied <migration>` before new migrations will apply.

### Cloudinary Webhooks

- `rawBody: true` is enabled in `NestFactory.create()` (both `main.ts` and `vercel.ts`) so the raw request body is available for signature verification.
- The webhook handler (`src/webhooks/webhooks.controller.ts`) validates the `x-cld-timestamp` and `x-cld-signature` headers against the raw body before processing.
- The **signing key** used by Cloudinary must be explicitly set in the Cloudinary Console to match the account's API secret — otherwise verification will fail.
- Cloudinary's `public_id` in the webhook payload is the **full path** (`channels/{channelId}/videos/{videoId}`), not a bare UUID — lookups use the stored `publicId` column on `Video`, not the primary key.
- On webhook receipt, the video's `videoStatus` is updated to `PROCESSING`, `READY`, or `FAILED` based on the eager-transformation result, and `hlsUrl` is only set once status is `READY`.

---

## 🎯 Recommendations Engine

`VideoRepository.getRelatedVideos` builds a related-videos list using weighted signals, merged into a single score per video:

| Signal                                          | Weight |
| ----------------------------------------------- | ------ |
| Same channel                                    | 30     |
| Co-watched (viewers of this video also watched) | 40     |
| Shared tags                                     | 20     |
| Same category                                   | 10     |

Scores are summed across overlapping signals, sorted descending, and capped at 20 results. (A per-source diversity cap — e.g. max N videos from the same channel in the final list — is on the roadmap.)

---

## 🔐 Security Notes

- Passwords and other sensitive fields are never returned from Prisma queries without an explicit `select`.
- Refresh tokens are stored as SHA-256 hashes and rotated on every refresh; a reused/revoked token invalidates all sessions for that user.
- Access tokens are short-lived (15 minutes).
- Cloudinary upload-completion payloads are verified against Cloudinary's own signature, and the `public_id` path segment is cross-checked against the expected video ID to prevent metadata injection between videos.
- View counts are throttled per viewer (authenticated user ID, or a hashed IP+User-Agent for guests) via Redis to reduce trivial inflation.

---

## 🗺 Roadmap

- [ ] Role/admin system
- [ ] Per-source diversity cap for recommendations (max N videos per channel in results)
- [ ] `categoryId` vs. `name` filtering improvements in search
- [ ] IP-based geolocation + device naming for the session management UI

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
