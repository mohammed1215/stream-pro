export class GetChannelDetailsResponseDto {
  channelId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  channelImageUrl: string | null;
  videosCount: number;
  subscriptionsCount: number;
  totalViews: number;
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(channel: {
    channelId: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    channelImageUrl: string | null;
    videosCount: number;
    subscriptionsCount: number;
    totalViews: number;
    createdAt: Date;
    updatedAt: Date;
    isSubscribed: boolean;
  }) {
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
  }
}
