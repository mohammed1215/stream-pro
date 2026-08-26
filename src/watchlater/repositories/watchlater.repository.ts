import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WatchlaterRepository {
  constructor(private readonly prismaService: PrismaService) {}

  //   async createWatchLater(createWatchLater: Prisma.WatchLaterCreateInput) {
  //     return this.prismaService.watchLater.create({ data: createWatchLater });
  //   }

  async addToWatchLater(
    createWatchLater: Prisma.WatchLaterUncheckedCreateInput,
  ) {
    try {
      return await this.prismaService.watchLater.create({
        data: createWatchLater,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This video is already in the watchlater list',
        );
      }
      throw error;
    }
  }

  async findAllByUserId(userId: string, cursor?: string, limit = 20) {
    return this.prismaService.watchLater.findMany({
      where: { userId, video: { isDeleted: false } },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
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
      },
    });
  }

  async countWatchLaterByUserId(userId: string) {
    return this.prismaService.watchLater.count({
      where: { userId, video: { isDeleted: false } },
    });
  }

  findOne(userId: string, videoId: string) {
    return this.prismaService.watchLater.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { id: true },
    });
  }

  async removeFromWatchLater(userId: string, videoId: string) {
    try {
      return await this.prismaService.watchLater.delete({
        where: { userId_videoId: { videoId, userId } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Watch later item not found');
      }
      throw error;
    }
  }

  async checkWatchLaterStatus(userId: string, videoId: string) {
    const record = await this.prismaService.watchLater.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { id: true },
    });
    return !!record;
  }
}
