/*
  Warnings:

  - A unique constraint covering the columns `[userId,videoId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Comment_userId_videoId_idx" ON "Comment"("userId", "videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_userId_videoId_key" ON "Comment"("userId", "videoId");
