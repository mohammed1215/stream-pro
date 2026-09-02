/*
  Warnings:

  - Made the column `duration` on table `Video` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "size" SET DEFAULT 0;
