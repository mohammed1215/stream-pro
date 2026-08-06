import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty() subscriptionId: string;
  @ApiProperty() channelId: string;
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() createdAt: Date;

  constructor(
    subscriptionId: string,
    channelId: string,
    userId: string,
    name: string,
    email: string,
    createdAt: Date,
  ) {
    this.subscriptionId = subscriptionId;
    this.channelId = channelId;
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }
}

export class PaginatedSubscriptionResponseDto {
  @ApiProperty({ type: [SubscriptionResponseDto] })
  items: SubscriptionResponseDto[];
  @ApiProperty() pageNumber: number;
  @ApiProperty() pageSize: number;

  constructor(
    subscriptions: SubscriptionResponseDto[],
    pageNumber: number,
    pageSize: number,
  ) {
    this.items = subscriptions;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
