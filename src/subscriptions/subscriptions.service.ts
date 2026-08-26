import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../generated/prisma/browser';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationService: NotificationsService,
  ) {}
  async createSubscription(channelId: string, userId: string) {
    try {
      const subscription = await this.subscriptionRepository.createSubscription(
        {
          channel: { connect: { id: channelId } },
          user: { connect: { id: userId } },
        },
      );

      await this.notificationService.create({
        actorId: userId,
        recipientId: subscription.channel.userId,
        contextId: subscription.id,
        message: `You have subscribed to ${subscription.channel.title}`,
        type: NotificationType.SUBSCRIPTION,
      });

      return subscription;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException('Invalid channelId or userId provided.');
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'You are already subscribed to this channel.',
        );
      } else {
        throw error;
      }
    }
  }

  findOwnerChannelSubscriptions(
    channelId: string,
    pageOptions: { pageNumber: number; pageSize: number } = {
      pageNumber: 1,
      pageSize: 10,
    },
  ) {
    const validSkip = Math.max(
      0,
      (pageOptions.pageNumber - 1) * pageOptions.pageSize,
    );
    const validTake = Math.max(1, pageOptions.pageSize);

    return this.subscriptionRepository.findOwnerChannelSubscriptions(
      { channelId },
      {
        skip: validSkip,
        take: validTake,
      },
    );
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} subscription`;
  // }

  // update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
  //   return `This action updates a #${id} subscription`;
  // }

  removeSubscription(channelId: string, userId: string) {
    return this.subscriptionRepository.deleteSubscription(channelId, userId);
  }

  async findAllSubscriptions(
    userId: string,
    cursor?: string,
    pageSize: number = 10,
  ) {
    const items = await this.subscriptionRepository.findUserSubscriptions(
      userId,
      cursor,
      pageSize + 1,
    );

    const hasMore = items.length > pageSize;
    const sliced = hasMore ? items.slice(0, pageSize) : items;

    const subscriptions = sliced.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      channel: {
        id: item.channel.id,
        title: item.channel.title,
        thumbnailUrl: item.channel.thumbnailUrl,
        description: item.channel.description,
        subscriberCount: item.channel._count.subscriptions,
      },
    }));

    const nextCursor = hasMore
      ? subscriptions[subscriptions.length - 1].id
      : null;

    return { subscriptions, hasMore, nextCursor };
  }
}
