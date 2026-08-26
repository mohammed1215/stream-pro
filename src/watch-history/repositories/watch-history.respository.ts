import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WatchHistoryRespository {
  constructor(private readonly prisma: PrismaService) {}
  upsertProgress(params: {
    userId: string;
    videoId: string;
    channelId: string;
    watchedSeconds: number;
    videoDuration: number;
  }) {
    const { videoDuration, userId, videoId, channelId, watchedSeconds } =
      params;
    const completionRate =
      videoDuration > 0 ? watchedSeconds / videoDuration : 0;

    return this.prisma.watchHistory.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: {
        userId,
        videoId,
        channelId,
        watchedSeconds,
        completionRate,
        videoDuration,
      },
      update: {
        watchedSeconds,
        lastWatchedAt: new Date(),
        watchCount: { increment: watchedSeconds < 5 ? 1 : 0 },
        completionRate,
      },
    });
  }

  async findAllByUserId(userId: string, cursor?: string, limit = 20) {
    return this.prisma.watchHistory.findMany({
      where: { userId, video: { isDeleted: false } },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: [{ lastWatchedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        watchedSeconds: true,
        videoDuration: true,
        completionRate: true,
        lastWatchedAt: true,
        video: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            duration: true,
          },
        },
        channel: {
          select: { id: true, title: true, channelImageUrl: true },
        },
      },
    });
  }
}
