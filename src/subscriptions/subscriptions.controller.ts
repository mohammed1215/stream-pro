import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  Get,
  UseInterceptors,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { ApiResponse } from '@nestjs/swagger';
import { ChannelPreloadInterceptor } from 'src/interceptors/channel-preload.interceptor';
import { type ChannelRequestData } from 'src/types/channel.types';
import { Channel } from 'src/decorators/channel-decorator';
import {
  PaginatedSubscriptionResponseDto,
  SubscriptionResponseDto,
} from './dto/subscription-response.dto';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscriptions/:channelId')
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        channelId: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  })
  @UseGuards(AuthGuard)
  async create(
    @Param('channelId') channelId: string,
    @User() user: JwtUserPayload,
  ) {
    await this.subscriptionsService.createSubscription(channelId, user.userId);
    return {
      message: 'Subscription created successfully',
      channelId: channelId,
      userId: user.userId,
    };
  }

  @Get('owner/subscriptions')
  @UseGuards(AuthGuard)
  @UseInterceptors(ChannelPreloadInterceptor)
  async findOwnerChannelSubscriptions(
    @Channel() channel: ChannelRequestData,
    @Query(
      'pageNumber',
      new DefaultValuePipe(1),
      new ParseIntPipe({ optional: true }),
    )
    pageNumber: number = 1,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      new ParseIntPipe({ optional: true }),
    )
    pageSize: number = 10,
  ) {
    const subscriptions =
      await this.subscriptionsService.findOwnerChannelSubscriptions(
        channel.id,
        {
          pageNumber,
          pageSize,
        },
      );

    const subscriptionList = subscriptions.map(
      (subscription) =>
        new SubscriptionResponseDto(
          subscription.id,
          subscription.channelId,
          subscription.user.id,
          subscription.user.name,
          subscription.user.email,
          subscription.createdAt,
        ),
    );

    return new PaginatedSubscriptionResponseDto(
      subscriptionList,
      pageNumber,
      pageSize,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.subscriptionsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  // ) {
  //   return this.subscriptionsService.update(+id, updateSubscriptionDto);
  // }

  @Delete('subscriptions/:subscriptionId')
  @UseGuards(AuthGuard)
  async removeSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @User() user: JwtUserPayload,
  ) {
    await this.subscriptionsService.removeSubscription(
      subscriptionId,
      user.userId,
    );
    return { message: 'Subscription removed successfully' };
  }
}
