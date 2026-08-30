import { ApiProperty } from '@nestjs/swagger';

export class VideoResponseDto {
  @ApiProperty() videoId: string;
  @ApiProperty() title: string;
  @ApiProperty() videoUrl: string;
  @ApiProperty({ nullable: true }) thumbnailUrl: string | null;
  @ApiProperty() channelId: string;
  @ApiProperty() channelTitle: string;
  @ApiProperty() channelImageUrl: string | null;
  @ApiProperty() durationSeconds: number;
  @ApiProperty() views: number;

  constructor(
    id: string,
    title: string,
    videoUrl: string,
    thumbnailUrl: string | null,
    channelId: string,
    channelTitle: string,
    channelImageUrl: string | null,
    durationSeconds: number,
    views: number,
  ) {
    this.videoId = id;
    this.title = title;
    this.videoUrl = videoUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.channelId = channelId;
    this.channelTitle = channelTitle;
    this.channelImageUrl = channelImageUrl;
    this.durationSeconds = durationSeconds;
    this.views = views;
  }
}

export class PaginatedVideosResponseDto {
  @ApiProperty({ type: [VideoResponseDto] }) items: VideoResponseDto[];
  @ApiProperty() pageNumber: number;
  @ApiProperty() pageSize: number;

  constructor(items: VideoResponseDto[], pageNumber: number, pageSize: number) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
