import { ApiProperty } from '@nestjs/swagger';

export class SearchVideoResponseDto {
  @ApiProperty() videoId: string;
  @ApiProperty() title: string;
  @ApiProperty() thumbnailUrl: string | null;
  @ApiProperty() durationSeconds: number;
  @ApiProperty() videoUrl: string | null;
  @ApiProperty() hlsUrl: string | null;
  @ApiProperty() views: number;
  @ApiProperty() channelId: string;
  @ApiProperty() channelName: string;
  @ApiProperty() channelProfileImageUrl: string | null;
  @ApiProperty() updatedAt: Date;

  constructor(
    videoId: string,
    title: string,
    thumbnailUrl: string | null,
    durationSeconds: number,
    hlsUrl: string | null,
    videoUrl: string | null,
    views: number = 0,
    channelId: string,
    channelName: string,
    channelProfileImageUrl: string | null,
    updatedAt: Date,
  ) {
    this.videoId = videoId;
    this.title = title;
    this.thumbnailUrl = thumbnailUrl;
    this.durationSeconds = durationSeconds;
    this.videoUrl = videoUrl;
    this.hlsUrl = hlsUrl;
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
  @ApiProperty() totalCount: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() hasNextPage: boolean;

  constructor(
    items: SearchVideoResponseDto[],
    pageSize: number,
    pageNumber: number,
    totalCount: number,
  ) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.totalPages = Math.ceil(totalCount / pageSize);
    this.hasNextPage = pageNumber < this.totalPages;
  }
}
