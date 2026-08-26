import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLike(userId: string, videoId: string) {
    try {
      return this.prisma.like.create({
        data: {
          userId,
          videoId,
        },
        include: { video: { include: { channel: true } }, user: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('you already liked this video');
      }
    }
  }

  async findAllLikedVideos(userId: string, cursor?: string, limit = 20) {
    return this.prisma.like.findMany({
      where: { userId },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        video: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            duration: true,
            views: true,
            createdAt: true,
            channel: {
              select: {
                id: true,
                title: true,
                channelImageUrl: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });
  }

  async countLikedVideos(userId: string) {
    return this.prisma.like.count({
      where: { userId },
    });
  }

  async removeLike(userId: string, videoId: string) {
    return this.prisma.like.deleteMany({
      where: { userId, videoId },
    });
  }
}
