import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/generated/prisma/browser';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationService: NotificationsService,
  ) {}
  async createSubscription(channelId: string, userId: string) {
    const subscription = await this.subscriptionRepository.createSubscription({
      channel: { connect: { id: channelId } },
      user: { connect: { id: userId } },
    });

    await this.notificationService.create({
      actorId: userId,
      recipientId: subscription.channel.userId,
      contextId: subscription.id,
      message: `You have subscribed to ${subscription.channel.title}`,
      type: NotificationType.SUBSCRIPTION,
    });

    return subscription;
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

  removeSubscription(subscriptionId: string, userId: string) {
    return this.subscriptionRepository.deleteSubscription(
      subscriptionId,
      userId,
    );
  }
}
