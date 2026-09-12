import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HomeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTrendingVideos() {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
      },
      orderBy: {
        views: 'desc',
      },
      take: 10,
      include: {
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }

  async findLatestVideos() {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }

  async findSubscriptionFeed(userId: string) {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        channel: {
          subscriptions: {
            some: {
              userId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }

  async findUserTasteProfile(userId: string) {
    const history = await this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        video: {
          select: {
            channelId: true,
            categoryId: true,
            tags: { select: { id: true } },
          },
        },
      },
    });

    const categoryIds = new Map<string, number>();
    const tagIds = new Map<string, number>();
    const channelIds = new Map<string, number>();

    history.forEach((item) => {
      const video = item.video;

      // get categoryId counts for the videos watched by the user
      if (video.categoryId) {
        categoryIds.set(
          video.categoryId,
          (categoryIds.get(video.categoryId) || 0) + 1,
        );
      }

      //  get tag counts for the videos watched by the user
      video.tags.forEach((tag) => {
        tagIds.set(tag.id, (tagIds.get(tag.id) || 0) + 1);
      });

      // get channel counts for the videos watched by the user
      if (video.channelId) {
        channelIds.set(
          video.channelId,
          (channelIds.get(video.channelId) || 0) + 1,
        );
      }
    });
    return {
      categoryIds,
      tagIds,
      channelIds,
      watchedVideoIds: history.map((item) => item.videoId),
    };
  }

  async findVideosBySpecificCategories(
    categoryIds: string[],
    excludeIds: string[],
    cursor?: string,
  ) {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        categoryId: {
          in: categoryIds,
        },
        id: {
          notIn: excludeIds,
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        channelId: true,
        categoryId: true,
        views: true,
        createdAt: true,
        tags: { select: { id: true } },
        title: true,
        thumbnailUrl: true,
        duration: true,
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }

  async findCoWatchers(videoIds: string[], currentUserId: string) {
    const result = await this.prisma.watchHistory.findMany({
      where: {
        videoId: { in: videoIds },
        userId: { not: currentUserId },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: 100,
    });
    return result.map((r) => r.userId);
  }

  async findVideosByCoWatch(
    userIds: string[],
    excludeIds: string[],
    cursor?: string,
  ) {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        watchHistories: {
          some: { user: { id: { in: userIds } } },
        },
        id: {
          notIn: excludeIds,
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        channelId: true,
        categoryId: true,
        views: true,
        createdAt: true,
        tags: { select: { id: true } },
        title: true,
        thumbnailUrl: true,
        duration: true,
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }

  async findVideosBySpecificTags(
    tagIds: string[],
    excludeIds: string[],
    cursor?: string,
  ) {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        tags: {
          some: {
            id: {
              in: tagIds,
            },
          },
        },
        id: {
          notIn: excludeIds,
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        channelId: true,
        categoryId: true,
        views: true,
        createdAt: true,
        tags: { select: { id: true } },
        title: true,
        thumbnailUrl: true,
        duration: true,
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }

  async findVideosBySpecificChannels(
    channelIds: string[],
    excludeIds: string[],
    cursor?: string,
  ) {
    return this.prisma.video.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        channelId: {
          in: channelIds,
        },
        id: { notIn: excludeIds },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        channelId: true,
        categoryId: true,
        views: true,
        createdAt: true,
        tags: { select: { id: true } },
        title: true,
        thumbnailUrl: true,
        duration: true,
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });
  }
}
