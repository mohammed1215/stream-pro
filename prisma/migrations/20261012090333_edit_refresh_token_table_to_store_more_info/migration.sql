-- CreateEnum
CREATE TYPE "RevokedReason" AS ENUM ('LOGOUT', 'LOGOUT_ALL', 'REUSE_DETECTED', 'EXPIRED', 'ADMIN');

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "appVersion" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdIp" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "lastIp" TEXT,
ADD COLUMN     "loginMethod" "AuthProvider",
ADD COLUMN     "replacedByHash" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedReason" "RevokedReason",
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
