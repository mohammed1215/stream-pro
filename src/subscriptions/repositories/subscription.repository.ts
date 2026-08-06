import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSubscription(subscriptionData: Prisma.SubscriptionCreateInput) {
    return this.prismaService.subscription.create({
      data: subscriptionData,
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

  deleteSubscription(subscriptionId: string, userId: string) {
    return this.prismaService.subscription.deleteMany({
      where: {
        id: subscriptionId,
        userId: userId,
      },
    });
  }
}
