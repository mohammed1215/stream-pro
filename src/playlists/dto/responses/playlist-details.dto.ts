import { ApiProperty } from '@nestjs/swagger';

export class PlaylistItemDto {
  @ApiProperty() videoId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() thumbnailUrl!: string;
  @ApiProperty() duration!: number;
  @ApiProperty() views!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() channelId!: string;
  @ApiProperty() channelTitle!: string;
  @ApiProperty() channelImageUrl!: string | null;
}

export class PlaylistDetailsDto {
  @ApiProperty() playlistId!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() isPublic!: boolean;
  @ApiProperty() videoCount!: number;
  @ApiProperty() items!: PlaylistItemDto[];
}
