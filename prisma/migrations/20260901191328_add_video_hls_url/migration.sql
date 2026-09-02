-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "hlsUrl" TEXT,
ALTER COLUMN "videoUrl" DROP NOT NULL;
