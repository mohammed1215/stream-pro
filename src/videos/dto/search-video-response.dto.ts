import { ApiProperty } from '@nestjs/swagger';

export class SearchVideoResponseDto {
  @ApiProperty() videoId: string;
  @ApiProperty() title: string;
  @ApiProperty() thumbnailUrl: string;
  @ApiProperty() duration: number;
  @ApiProperty() videoUrl: string;
  @ApiProperty() views: number;
  @ApiProperty() channelId: string;
  @ApiProperty() channelName: string;
  @ApiProperty() channelProfileImageUrl: string | null;
  @ApiProperty() updatedAt: Date;

  constructor(
    videoId: string,
    title: string,
    thumbnailUrl: string,
    duration: number,
    videoUrl: string,
    views: number = 0,
    channelId: string,
    channelName: string,
    channelProfileImageUrl: string | null,
    updatedAt: Date,
  ) {
    this.videoId = videoId;
    this.title = title;
    this.thumbnailUrl = thumbnailUrl;
    this.duration = duration;
    this.videoUrl = videoUrl;
    this.views = views;
    this.channelId = channelId;
    this.channelName = channelName;
    this.channelProfileImageUrl = channelProfileImageUrl;
    this.updatedAt = updatedAt;
  }
}

export class PaginatedSearchVideoResponseDto {
  @ApiProperty({ type: [SearchVideoResponseDto] })
  items: SearchVideoResponseDto[];
  @ApiProperty() pageSize: number;
  @ApiProperty() pageNumber: number;

  constructor(
    items: SearchVideoResponseDto[],
    pageSize: number,
    pageNumber: number,
  ) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
