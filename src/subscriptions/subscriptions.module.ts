import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { ChannelModule } from '../channel/channel.module';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionRepository],
  imports: [ChannelModule],
})
export class SubscriptionsModule {}
