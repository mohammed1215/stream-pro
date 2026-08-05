import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import {
  VIDEO_DETAILS_SELECT,
  VIDEO_LIST_OWNER_SELECT,
  VIDEO_LIST_SELECT,
} from './video-select';
import { Prisma } from 'generated/prisma/client';

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

  async findAllVideosOfChannel(channelId: string, page: number, limit: number) {
    const videos = await this.prisma.video.findMany({
      where: { channelId, isPublished: true, isDeleted: false },
      orderBy: { updatedAt: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
      select: VIDEO_LIST_SELECT,
    });

    return videos;
  }

  async findAllVideosOfOwnerChannel(
    channelId: string,
    page: number,
    limit: number,
  ) {
    const videos = await this.prisma.video.findMany({
      where: { channelId, isDeleted: false },
      orderBy: { updatedAt: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
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
}
