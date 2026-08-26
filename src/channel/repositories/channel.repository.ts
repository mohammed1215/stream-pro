import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { Prisma } from 'src/generated/prisma/client';
import { UpdateChannelDto } from '../dto/update-channel.dto';

@Injectable()
export class ChannelRepository {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createChannelDto: CreateChannelDto) {
    const channel = await this.prisma.channel.create({
      data: { ...createChannelDto, userId },
      select: {
        id: true,
        title: true,
        description: true,
        channelImageUrl: true,
        thumbnailUrl: true,
      },
    });
    return channel;
  }

  async findOneByUserId(userId: string) {
    return this.prisma.channel.findUnique({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        channelImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findChannelVideosPaginated(
    channelId: string,
    userId?: string,
    pageNumber: number = 1,
    pageSize: number = 10,
  ) {
    const [videos, totalCount] = await Promise.all([
      this.prisma.video.findMany({
        where: { channelId, isPublished: true },
        include: {
          watchLaters: userId
            ? { where: { userId }, take: 1, select: { id: true } }
            : false,
          likes: userId
            ? { where: { userId }, take: 1, select: { id: true } }
            : false,
        },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.video.count({ where: { channelId, isPublished: true } }),
    ]);

    return { videos, totalCount };
  }
  async exists(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true },
    });
    return !!channel;
  }

  async findOneByIdWithCounts(channelId: string, userId?: string) {
    const [channel, totalViews, isSubscribed] = await Promise.all([
      this.prisma.channel.findUnique({
        where: { id: channelId },
        include: { _count: { select: { videos: true, subscriptions: true } } },
      }),
      this.prisma.video.aggregate({
        where: { channelId },
        _sum: { views: true },
      }),
      userId
        ? this.prisma.subscription.findFirst({ where: { channelId, userId } })
        : Promise.resolve(null),
    ]);

    if (!channel) return null;

    return {
      ...channel,
      totalViews: totalViews._sum.views ?? 0,
      isSubscribed: !!isSubscribed,
    };
  }

  async findChannelPlaylists(
    channelId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
  ) {
    const playlists = await this.prisma.playlist.findMany({
      where: { user: { channel: { id: channelId } }, isPublic: true },
      include: { _count: { select: { videos: true } } },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const count = await this.prisma.playlist.count({
      where: { user: { channel: { id: channelId } }, isPublic: true },
    });
    return { playlists, totalCount: count };
  }
  async findHomeChannel(channelId: string, userId: string | undefined) {
    const videos = await this.prisma.video.findMany({
      where: { isPublished: true, channelId },
      include: {
        watchLaters: userId
          ? { where: { userId }, take: 1, select: { id: true } }
          : false,
        likes: userId
          ? { where: { userId }, take: 1, select: { id: true } }
          : false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const playlists = await this.prisma.playlist.findMany({
      where: { isPublic: true, user: { channel: { id: channelId } } },
      include: { _count: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return { videos, playlists };
  }

  async updateThumbnailUrl(channelId: string, thumbnailUrl: string) {
    return this.prisma.channel.update({
      where: { id: channelId },
      data: { thumbnailUrl },
    });
  }

  async updateChannelImageUrl(channelId: string, channelImageUrl: string) {
    return this.prisma.channel.update({
      where: { id: channelId },
      data: { channelImageUrl },
    });
  }

  async updateChannelDetails(
    userId: string,
    updateChannelDto: UpdateChannelDto,
  ) {
    try {
      return await this.prisma.channel.update({
        where: { userId },
        data: {
          title: updateChannelDto.title,
          description: updateChannelDto.description,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Channel not found');
      }
      throw error;
    }
  }
}
