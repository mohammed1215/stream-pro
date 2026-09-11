import { ApiProperty } from '@nestjs/swagger';
import { VideoResponseDto } from './video-response.dto';
import { TagResponseDto } from '../../tags/dto/responses/tag-response.dto';

export class VideoDetailsResponseDto extends VideoResponseDto {
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() commentsCount: number;
  @ApiProperty() likesCount: number;
  @ApiProperty() channelSubscribersCount: number;
  @ApiProperty({ nullable: true }) isSubscribed: boolean | null;
  @ApiProperty({ nullable: true }) isLiked: boolean | null;
  @ApiProperty() tags!: TagResponseDto[];
  @ApiProperty() createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string | null,
    videoUrl: string | null,
    hlsUrl: string | null,
    thumbnailUrl: string | null,
    channelId: string,
    channelTitle: string,
    channelImageUrl: string | null,
    durationSeconds: number,
    views: number,
    commentsCount: number,
    likesCount: number,
    channelSubscribersCount: number,
    isSubscribed: boolean | null,
    isLiked: boolean | null,
    tags: TagResponseDto[],
    createdAt: Date,
  ) {
    super(
      id,
      title,
      videoUrl,
      hlsUrl,
      thumbnailUrl,
      channelId,
      channelTitle,
      channelImageUrl,
      durationSeconds,
      views,
    );
    this.description = description;
    this.commentsCount = commentsCount;
    this.likesCount = likesCount;
    this.channelSubscribersCount = channelSubscribersCount;
    this.isSubscribed = isSubscribed;
    this.isLiked = isLiked;
    this.tags = tags;
    this.createdAt = createdAt;
  }
}
