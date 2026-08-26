import { ApiProperty } from '@nestjs/swagger';

export class GetChannelDetailsResponseDto {
  @ApiProperty() channelId: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) thumbnailUrl: string | null;
  @ApiProperty({ nullable: true }) channelImageUrl: string | null;
  @ApiProperty() videosCount: number;
  @ApiProperty() subscriptionsCount: number;
  @ApiProperty() totalViews: number;
  @ApiProperty() isSubscribed: boolean;
  @ApiProperty() isOwner: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(channel: GetChannelDetailsResponseDto) {
    this.channelId = channel.channelId;
    this.title = channel.title;
    this.description = channel.description;
    this.thumbnailUrl = channel.thumbnailUrl;
    this.channelImageUrl = channel.channelImageUrl;
    this.videosCount = channel.videosCount;
    this.subscriptionsCount = channel.subscriptionsCount;
    this.totalViews = channel.totalViews;
    this.isSubscribed = channel.isSubscribed;
    this.createdAt = channel.createdAt;
    this.updatedAt = channel.updatedAt;
    this.isOwner = channel.isOwner;
  }
}
