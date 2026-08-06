import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import {
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

    return videos;
  }

  async findOneVideoDetails(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId, isDeleted: false, isPublished: true },
      select: VIDEO_DETAILS_SELECT,
    });

    return video;
  }

  async findOneOwnerVideoDetails(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId, isDeleted: false },
      select: VIDEO_DETAILS_SELECT,
    });

    return video;
  }

  async searchVideos(query: string, pageNumber: number, pageSize: number) {
    const skip = (pageNumber - 1) * pageSize;
    const items = await this.prisma.$queryRaw<
      [
        {
          id: string;
          title: string;
          description: string;
          thumbnailUrl: string;
          videoUrl: string;
          isPublished: boolean;
          createdAt: Date;
          updatedAt: Date;
          duration: number;
          size: number;
          rank: number;
          channelId: string;
          channelName: string;
          channelProfileImageUrl: string;
        },
      ]
    >`
      SELECT "Video".id, "Video".title, "Video".description, "Video"."thumbnailUrl", "Video"."videoUrl", "Video"."isPublished", "Video"."createdAt", "Video"."updatedAt", "Video"."duration", "Video"."size", "Video"."channelId" AS "channelId","Channel"."title" AS "channelName", "Channel"."channelImageUrl" AS "channelProfileImageUrl",
      ts_rank("searchVector", plainto_tsquery('english', ${query})) AS rank
      FROM "Video"
      Join "Channel" ON "Video"."channelId" = "Channel"."id"
      WHERE "searchVector" @@ plainto_tsquery('english', ${query})
      AND "isPublished" = true
      ORDER BY rank DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    const [{ totalCount }] = await this.prisma.$queryRaw<
      [{ totalCount: number }]
    >`
      SELECT COUNT(*)::integer AS "totalCount"
      FROM "Video"
      WHERE "searchVector" @@ plainto_tsquery('english', ${query})
      AND "isPublished" = true
    `;

    return {
      items,
      totalCount,
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
