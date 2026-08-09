import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLike(userId: string, videoId: string) {
    return this.prisma.like.create({
      data: {
        userId,
        videoId,
      },
      include: { video: { include: { channel: true } }, user: true },
    });
  }

  async removeLike(userId: string, likeId: string) {
    return this.prisma.like.delete({
      where: { userId, id: likeId },
    });
  }
}
