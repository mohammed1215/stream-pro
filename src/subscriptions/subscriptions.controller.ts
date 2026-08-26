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
import { AuthGuard } from '../user/guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ChannelPreloadInterceptor } from '../interceptors/channel-preload.interceptor';
import { type ChannelRequestData } from '../types/channel.types';
import { Channel } from '../decorators/channel-decorator';
import {
  PaginatedSubscriptionResponseDto,
  SubscriptionResponseDto,
} from './dto/subscription-response.dto';
import { PaginatedSubscriptionsResponseDto } from './dto/response/subscriptions-response.dto';

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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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

  @Delete('subscriptions/:channelId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async removeSubscription(
    @Param('channelId') channelId: string,
    @User() user: JwtUserPayload,
  ) {
    await this.subscriptionsService.removeSubscription(channelId, user.userId);
    return { message: 'Subscription removed successfully' };
  }

  @Get('/subscriptions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get the authenticated user's channel subscriptions",
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description:
      'ID of the last subscription from the previous page, for cursor-based pagination',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of subscriptions to return per page',
    example: 10,
  })
  @ApiOkResponse({
    description: "Paginated list of the user's channel subscriptions",
    type: PaginatedSubscriptionsResponseDto,
  })
  async findAllSubscriptions(
    @User() user: JwtUserPayload,
    @Query('cursor') cursor?: string,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      new ParseIntPipe({ optional: true }),
    )
    pageSize: number = 10,
  ) {
    return this.subscriptionsService.findAllSubscriptions(
      user.userId,
      cursor,
      pageSize,
    );
  }
}
