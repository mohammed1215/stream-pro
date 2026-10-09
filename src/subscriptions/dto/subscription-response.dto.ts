import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty() subscriptionId: string;
  @ApiProperty() channelId: string;
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true, type: 'string' }) avatarUrl: string | null;
  @ApiProperty({ nullable: true, type: 'string' })
  channelTitle: string | null;
  @ApiProperty({ nullable: true, type: 'string' })
  channelThumbnailUrl: string | null;
  @ApiProperty({ nullable: true, type: 'string' })
  channelImageUrl: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ nullable: true }) userChannelId: string | null;

  constructor(
    subscriptionId: string,
    channelId: string,
    userId: string,
    userChannelId: string | null,
    name: string,
    email: string,
    avatarUrl: string | null,
    channelTitle: string | null,
    channelThumbnailUrl: string | null,
    channelImageUrl: string | null,
    createdAt: Date,
  ) {
    this.subscriptionId = subscriptionId;
    this.channelId = channelId;
    this.userId = userId;
    this.userChannelId = userChannelId;
    this.name = name;
    this.email = email;
    this.avatarUrl = avatarUrl;
    this.channelTitle = channelTitle;
    this.channelThumbnailUrl = channelThumbnailUrl;
    this.channelImageUrl = channelImageUrl;
    this.createdAt = createdAt;
  }
}

export class PaginatedSubscriptionResponseDto {
  @ApiProperty({ type: [SubscriptionResponseDto] })
  items: SubscriptionResponseDto[];
  @ApiProperty() pageNumber: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() hasNextPage!: boolean;
  @ApiProperty() hasPreviousPage!: boolean;
  @ApiProperty() totalPages!: number;

  constructor(
    subscriptions: SubscriptionResponseDto[],
    pageNumber: number,
    pageSize: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    totalPages: number,
  ) {
    this.items = subscriptions;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.hasNextPage = hasNextPage;
    this.hasPreviousPage = hasPreviousPage;
    this.totalPages = totalPages;
  }
}
