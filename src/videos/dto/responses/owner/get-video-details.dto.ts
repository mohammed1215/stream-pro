import { ApiProperty } from '@nestjs/swagger';

export class VideoDetailsOwnerResponseDto {
  @ApiProperty() videoId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() videoUrl!: string;
  @ApiProperty() hlsUrl!: string;
  @ApiProperty({ nullable: true, type: 'string' }) thumbnailUrl!: string | null;
  @ApiProperty() channelId!: string;
  @ApiProperty() channelTitle!: string;
  @ApiProperty({ nullable: true, type: 'string' }) channelImageUrl!:
    string | null;
  @ApiProperty() durationSeconds!: number;
  @ApiProperty() views!: number;
  @ApiProperty() isPublished!: boolean;
  @ApiProperty({ nullable: true, type: 'string' }) publishTime!: Date | null;
  @ApiProperty({ type: 'array', items: { type: 'string' } }) tags!: string[];
  @ApiProperty({ nullable: true, type: 'string' }) categoryId!: string | null;
  @ApiProperty() description!: string;
  @ApiProperty() commentsCount!: number;
  @ApiProperty() likesCount!: number;
  @ApiProperty() channelSubscribersCount!: number;
  @ApiProperty() isSubscribed!: boolean;
  @ApiProperty() isLiked!: boolean;
  @ApiProperty() createdAt!: Date;
}
