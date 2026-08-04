# syntax=docker/dockerfile:1

########################
# 1. Install deps
########################
FROM node:20-slim AS deps
WORKDIR /app

# openssl is required by Prisma's query engine at generate/runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

########################
# 2. Build
########################
FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generates the Prisma client into ./generated/prisma/client (per your PrismaService import path)
RUN npx prisma generate

RUN npm run build

# Drop devDependencies, keep node_modules lean for the final image
RUN npm prune --omit=dev

########################
# 3. Production runtime
########################
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/generated ./generated
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --chown=nestjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nestjs
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]