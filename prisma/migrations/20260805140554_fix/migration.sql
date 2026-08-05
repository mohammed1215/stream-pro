/*
  Warnings:

  - A unique constraint covering the columns `[userId,channelId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,videoId]` on the table `WatchLater` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_channelId_key" ON "Subscription"("userId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchLater_userId_videoId_key" ON "WatchLater"("userId", "videoId");
