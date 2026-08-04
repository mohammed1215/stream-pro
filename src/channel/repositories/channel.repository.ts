import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChannelDto } from '../dto/create-channel.dto';

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
}
