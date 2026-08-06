import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './repositories/subscription.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}
  createSubscription(channelId: string, userId: string) {
    return this.subscriptionRepository.createSubscription({
      channel: { connect: { id: channelId } },
      user: { connect: { id: userId } },
    });
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
