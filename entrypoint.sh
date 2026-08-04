#!/bin/sh
set -e

echo "Running Prisma migrations against \$DATABASE_URL ..."
npx prisma migrate deploy

echo "Starting NestJS server..."
exec node dist/main.js