import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DownloadRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(videoId: string, userId: string) {
    return this.prisma.download.create({
      data: {
        videoId,
        userId,
      },
    });
  }

  async findById(videoId: string) {
    return this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        publicId: true,
        title: true,
        size: true,
      },
    });
  }
}
