import { ApiProperty } from '@nestjs/swagger';
import { VideoResponseDto } from './video-response.dto';

export class VideoDetailsResponseDto extends VideoResponseDto {
  @ApiProperty() description: string;
  @ApiProperty() commentsCount: number;
  @ApiProperty() likesCount: number;
  @ApiProperty() channelSubscribersCount: number;
  @ApiProperty({ nullable: true }) isSubscribed: boolean | null;
  @ApiProperty({ nullable: true }) isLiked: boolean | null;
  @ApiProperty() createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    videoUrl: string,
    thumbnailUrl: string,
    channelId: string,
    channelTitle: string,
    channelImageUrl: string | null,
    duration: number,
    views: number,
    commentsCount: number,
    likesCount: number,
    channelSubscribersCount: number,
    isSubscribed: boolean | null,
    isLiked: boolean | null,
    createdAt: Date,
  ) {
    super(
      id,
      title,
      videoUrl,
      thumbnailUrl,
      channelId,
      channelTitle,
      channelImageUrl,
      duration,
      views,
    );
    this.description = description;
    this.commentsCount = commentsCount;
    this.likesCount = likesCount;
    this.channelSubscribersCount = channelSubscribersCount;
    this.isSubscribed = isSubscribed;
    this.isLiked = isLiked;
    this.createdAt = createdAt;
  }
}
