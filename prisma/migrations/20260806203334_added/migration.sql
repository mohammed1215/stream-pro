-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "deviceToken" TEXT,
ADD COLUMN     "deviceType" "DeviceType";
