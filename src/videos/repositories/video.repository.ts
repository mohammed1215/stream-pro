import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import {
  VIDEO_DETAILS_SELECT,
  VIDEO_LIST_OWNER_SELECT,
  VIDEO_LIST_SELECT,
} from './video-select';
import { Prisma } from '../../generated/prisma/client';
import { SortByVideo } from '../dto/video-query.dto';
import { VideoOrderByWithAggregationInput } from '../../generated/prisma/models';
import { VideoSortByEnum, VideoStatusEnum } from '../enum/enums';

@Injectable()
export class VideoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createVideoDto: CreateVideoDto,
    duration: number,
    size: number,
    thumbnailUrl: string,
    videoUrl: string,
    channelId: string,
  ) {
    const video = await this.prisma.video.create({
      data: {
        ...createVideoDto,
        duration,
        size,
        thumbnailUrl,
        videoUrl,
        channelId,
      },
      select: {
        id: true,
        description: true,
        title: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        duration: true,
        size: true,
      },
    });

    return video;
  }

  async findAllVideosOfChannel(
    channelId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: SortByVideo,
  ) {
    const orderBy = this.getVideoOrderByObject(sortBy);
    const videos = await this.prisma.video.findMany({
      where: { channelId, isPublished: true, isDeleted: false },
      orderBy,
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      select: VIDEO_LIST_SELECT,
    });

    return videos;
  }

  async findAllVideosOfOwnerChannel(
    channelId: string,
    pageNumber: number,
    pageSize: number,
    status: VideoStatusEnum = VideoStatusEnum.ALL,
    sortBy: VideoSortByEnum = VideoSortByEnum.NEWEST,
  ) {
    const where: Prisma.VideoWhereInput = {
      channelId,
      isDeleted: false,
      ...(status === VideoStatusEnum.PUBLISHED
        ? { isPublished: true }
        : status === VideoStatusEnum.UNPUBLISHED
          ? { isPublished: false }
          : {}),
    };

    const videos = await this.prisma.video.findMany({
      where,
      orderBy:
        sortBy === VideoSortByEnum.MOST_VIEWED
          ? { views: 'desc' }
          : sortBy === VideoSortByEnum.OLDEST
            ? { createdAt: 'asc' }
            : { createdAt: 'desc' },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      select: VIDEO_LIST_OWNER_SELECT,
    });

    return videos;
  }

  async countVideosOfChannel(owner: boolean) {
    return this.prisma.video.count({
      where: { isDeleted: false, isPublished: !owner },
    });
  }

  async findOneVideoDetails(videoId: string, userId?: string) {
    if (userId) {
      const video = await this.prisma.video.findUnique({
        where: { id: videoId, isDeleted: false, isPublished: true },
        select: {
          id: true,
          description: true,
          title: true,
          views: true,
          duration: true,
          createdAt: true,
          updatedAt: true,
          videoUrl: true,
          hlsUrl: true,
          thumbnailUrl: true,
          likes: {
            where: { userId },
            select: { id: true },
            take: 1,
          },
          channel: {
            select: {
              id: true,
              title: true,
              channelImageUrl: true,
              description: true,
              thumbnailUrl: true,
              _count: true,
              subscriptions: {
                where: { userId },
                select: { id: true },
                take: 1,
              },
            },
          },
          _count: true,
        },
      });

      if (!video) return null;

      return {
        ...video,
        channel: {
          ...video.channel,
          isSubscribed: video.channel.subscriptions.length > 0,
        },
        isLikedByUser: video.likes.length > 0,
      };
    }

    const video = await this.prisma.video.findUnique({
      where: { id: videoId, isDeleted: false, isPublished: true },
      select: VIDEO_DETAILS_SELECT,
    });

    if (!video) return null;

    return {
      ...video,
      channel: {
        ...video.channel,
        isSubscribed: null,
      },
      isLikedByUser: null,
    };
  }

  async findOneOwnerVideoDetails(videoId: string, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: {
        id: videoId,
        isDeleted: false,
        channel: { userId },
      },
      select: {
        id: true,
        description: true,
        title: true,
        views: true,
        duration: true,
        updatedAt: true,
        videoUrl: true,
        hlsUrl: true,
        thumbnailUrl: true,
        isPublished: true,
        createdAt: true,
        likes: { where: { userId }, select: { id: true }, take: 1 },
        channel: {
          select: {
            id: true,
            title: true,
            channelImageUrl: true,
            description: true,
            thumbnailUrl: true,
            _count: true,
            subscriptions: { where: { userId }, select: { id: true }, take: 1 },
          },
        },
        _count: true,
      },
    });

    if (!video) return null;

    return {
      ...video,
      channel: {
        ...video.channel,
        isSubscribed: video.channel.subscriptions.length > 0,
      },
      isLikedByUser: video.likes.length > 0,
    };
  }

  async checkUserLikedVideo(userId: string, videoId: string) {
    return (await this.prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    }))
      ? true
      : false;
  }

  async checkUserSubscribedToChannel(userId: string, channelId: string) {
    return (await this.prisma.subscription.findUnique({
      where: { userId_channelId: { userId, channelId } },
    }))
      ? true
      : false;
  }

  async findById(videoId: string) {
    return this.prisma.video.findUnique({
      where: { id: videoId, isDeleted: false },
    });
  }

  async searchVideos(query: string, pageNumber: number, pageSize: number) {
    const skip = (pageNumber - 1) * pageSize;
    const items = await this.prisma.video.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        isDeleted: false,
        isPublished: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: pageSize,
      skip,
      select: VIDEO_LIST_SELECT,
    });
    return {
      items,
      totalCount: items.length, // Replace this with the actual total count if available
    };
  }

  async updateViews(videoId: string) {
    const video = await this.prisma.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } },
    });

    return video;
  }

  async publishAndUnPublishVideo(
    videoId: string,
    channelId: string,
  ): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE "Video"
      SET "isPublished" = NOT "isPublished"
      WHERE "id" = ${videoId} AND "channelId" = ${channelId};
    `;
  }

  async removeVideo(videoId: string, channelId: string) {
    const video = await this.prisma.video.update({
      where: { id: videoId, isDeleted: false, channelId },
      data: { isDeleted: true },
    });

    return video;
  }

  /**
   * Generic, reusable update. `select` is passed in by the caller so each
   * call site gets back exactly the shape it needs (and the correct type),
   * instead of this method hardcoding one fixed select for every caller.
   *
   * Returns null (instead of throwing) when the row doesn't exist or isn't
   * owned by channelId, so callers can turn that into a clean NotFoundException.
   */
  async updateVideoDetails<S extends Prisma.VideoSelect>(
    videoId: string,
    channelId: string,
    data: Prisma.VideoUpdateInput,
    select: S,
  ): Promise<Prisma.VideoGetPayload<{ select: S }> | null> {
    try {
      return await this.prisma.video.update({
        where: { id: videoId, channelId, isDeleted: false },
        data,
        select,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        return null;
      }
      throw err;
    }
  }

  getVideoOrderByObject(sortBy: SortByVideo): VideoOrderByWithAggregationInput {
    switch (sortBy) {
      case SortByVideo.CREATED_ASC:
        return { updatedAt: 'asc' };

      case SortByVideo.CREATED_DSC:
        return { updatedAt: 'desc' };

      case SortByVideo.LIKES_ASC:
        // orderBy?._count?.likes = 'asc';
        return {};
      case SortByVideo.LIKES_DSC:
        // orderBy?._count?.likes = 'dsc';
        return {};
      case SortByVideo.VIEWS_ASC:
        return { views: 'asc' };

      case SortByVideo.VIEWS_DSC:
        return { views: 'desc' };

      default:
        return { updatedAt: 'asc' };
    }
  }

  handleUploadNotification({
    publicId,
    status,
    hlsUrl,
  }: {
    publicId: string;
    status: string;
    hlsUrl: string | null;
  }) {
    return this.prisma.video.update({
      where: { id: publicId },
      data: { status, hlsUrl },
    });
  }
}
