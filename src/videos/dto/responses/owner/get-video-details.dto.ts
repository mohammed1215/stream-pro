import { ApiProperty } from '@nestjs/swagger';

export class VideoDetailsOwnerResponseDto {
  @ApiProperty() videoId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() videoUrl!: string;
  @ApiProperty({ nullable: true, type: 'string' }) thumbnailUrl!: string | null;
  @ApiProperty() channelId!: string;
  @ApiProperty() channelTitle!: string;
  @ApiProperty({ nullable: true, type: 'string' }) channelImageUrl!:
    string | null;
  @ApiProperty() duration!: number;
  @ApiProperty() views!: number;
  @ApiProperty() isPublished!: boolean;
}
