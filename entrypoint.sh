#!/bin/sh
set -e

# Reassemble FIREBASE_SERVICE_ACCOUNT from chunked, base64-encoded parts
i=1
eval "val=\${FIREBASE_SA_B64_$i}"
FIREBASE_SA_B64=""
while [ -n "$val" ]; do
  FIREBASE_SA_B64="${FIREBASE_SA_B64}${val}"
  i=$((i + 1))
  eval "val=\${FIREBASE_SA_B64_$i}"
done

if [ -n "$FIREBASE_SA_B64" ]; then
  export FIREBASE_SERVICE_ACCOUNT="$(printf '%s' "$FIREBASE_SA_B64" | base64 -d)"
fi

echo "Running Prisma migrations against \$DATABASE_URL ..."
npx prisma migrate deploy

echo "Starting NestJS server..."
exec node dist/main.js