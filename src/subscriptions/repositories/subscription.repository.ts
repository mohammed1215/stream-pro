import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSubscription(subscriptionData: Prisma.SubscriptionCreateInput) {
    return this.prismaService.subscription.create({
      data: subscriptionData,
      include: { channel: true, user: true },
    });
  }

  async findOwnerChannelSubscriptions(
    filter: Prisma.SubscriptionWhereInput = {},
    pageOptions: { skip?: number; take?: number } = { skip: 0, take: 10 },
  ) {
    return this.prismaService.subscription.findMany({
      where: filter,
      select: {
        id: true,
        user: { select: { id: true, name: true, email: true } },
        channelId: true,
        createdAt: true,
      },
      skip: pageOptions.skip,
      take: pageOptions.take,
    });
  }

  deleteSubscription(channelId: string, userId: string) {
    return this.prismaService.subscription.deleteMany({
      where: {
        channelId,
        userId: userId,
      },
    });
  }

  async findUserSubscriptions(
    userId: string,
    cursor: string | undefined,
    take: number,
  ) {
    return this.prismaService.subscription.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        channel: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            description: true,
            _count: { select: { subscriptions: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      take,
      skip: cursor ? 1 : 0,
    });
  }
}
