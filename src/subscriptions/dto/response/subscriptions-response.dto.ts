import { ApiProperty } from '@nestjs/swagger';

export class ChannelSummaryDto2 {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true, type: 'string' })
  thumbnailUrl!: string | null;

  @ApiProperty({ nullable: true, type: 'string' })
  description!: string | null;

  @ApiProperty()
  subscriberCount!: number;
}

export class SubscriptionItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: ChannelSummaryDto2 })
  channel!: ChannelSummaryDto2;
}

export class PaginatedSubscriptionsResponseDto {
  @ApiProperty({ type: [SubscriptionItemDto] })
  subscriptions!: SubscriptionItemDto[];

  @ApiProperty()
  hasMore!: boolean;

  @ApiProperty({ nullable: true })
  nextCursor!: string | null;
}
