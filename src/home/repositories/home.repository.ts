import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
