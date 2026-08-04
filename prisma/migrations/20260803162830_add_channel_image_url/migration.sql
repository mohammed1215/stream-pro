-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "channelImageUrl" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "thumbnailUrl" DROP NOT NULL;
