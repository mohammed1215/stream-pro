import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto } from '../dto/create-video.dto';

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
      select: {
        _count: true,
        id: true,
        title: true,
        updatedAt: true,
        views: true,
        duration: true,
        videoUrl: true,
        channel: { select: { title: true, channelImageUrl: true } },
      },
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
      select: {
        _count: true,
        id: true,
        title: true,
        updatedAt: true,
        views: true,
        duration: true,
        thumbnailUrl: true,
        videoUrl: true,
      },
    });

    return videos;
  }

  async findOneVideoDetails(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId, isDeleted: false, isPublished: true },
      select: {
        id: true,
        description: true,
        title: true,
        views: true,
        channel: {
          select: {
            channelImageUrl: true,
            id: true,
            description: true,
            thumbnailUrl: true,
          },
        },
      },
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
}
