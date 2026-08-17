import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import {
  VIDEO_DETAILS_OWNER_SELECT,
  VIDEO_DETAILS_SELECT,
  VIDEO_LIST_OWNER_SELECT,
  VIDEO_LIST_SELECT,
} from './video-select';
import { Prisma } from 'src/generated/prisma/client';
import { SortByVideo } from '../dto/video-query.dto';
import { VideoOrderByWithAggregationInput } from 'src/generated/prisma/models';

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
    // ordering object
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
  ) {
    const videos = await this.prisma.video.findMany({
      where: { channelId, isDeleted: false },
      orderBy: { updatedAt: 'asc' },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      select: VIDEO_LIST_OWNER_SELECT,
    });

    const totalCount = await this.prisma.video.count({
      where: { channelId, isDeleted: false },
    });

    return { videos, totalCount };
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

  async findOneOwnerVideoDetails(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId, isDeleted: false },
      select: VIDEO_DETAILS_OWNER_SELECT,
    });

    return video;
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

  async publishAndUnPublishVideo(videoId: string, channelId: string) {
    const video = await this.prisma.$executeRaw`
      UPDATE "Video"
      SET "isPublished" = NOT "isPublished"
      WHERE "id" = ${videoId} AND "channelId" = ${channelId};
    `;

    return video;
  }

  async removeVideo(videoId: string, channelId: string) {
    const video = await this.prisma.video.update({
      where: { id: videoId, isDeleted: false, channelId },
      data: { isDeleted: true },
    });

    return video;
  }

  async updateVideoDetails(
    videoId: string,
    channelId: string,
    updateVideoDto: Prisma.VideoUpdateInput,
  ) {
    const video = await this.prisma.video.update({
      where: { id: videoId, channelId, isDeleted: false },
      data: {
        ...updateVideoDto,
      },
      select: VIDEO_DETAILS_SELECT,
    });

    return video;
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
}
