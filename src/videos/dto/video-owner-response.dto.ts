import { ApiProperty } from '@nestjs/swagger';

export class VideoOwnerResponseDto {
  @ApiProperty() videoId: string;
  @ApiProperty() title: string;
  @ApiProperty() videoUrl: string | null;
  @ApiProperty() hlsUrl: string | null;
  @ApiProperty({ nullable: true }) thumbnailUrl: string | null;
  @ApiProperty() channelId: string;
  @ApiProperty() channelTitle: string;
  @ApiProperty() channelImageUrl: string | null;
  @ApiProperty() durationSeconds: number;
  @ApiProperty() views: number;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() description: string;
  @ApiProperty() createdAt: Date;

  constructor(
    id: string,
    title: string,
    videoUrl: string | null,
    hlsUrl: string | null,
    thumbnailUrl: string | null,
    channelId: string,
    channelTitle: string,
    channelImageUrl: string | null,
    durationSeconds: number,
    views: number,
    isPublished: boolean,
    description: string,
    createdAt: Date,
  ) {
    this.videoId = id;
    this.title = title;
    this.videoUrl = videoUrl;
    this.hlsUrl = hlsUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.channelId = channelId;
    this.channelTitle = channelTitle;
    this.channelImageUrl = channelImageUrl;
    this.durationSeconds = durationSeconds;
    this.views = views;
    this.isPublished = isPublished;
    this.description = description;
    this.createdAt = createdAt;
  }
}

export class PaginatedVideosOwnerResponseDto {
  @ApiProperty({ type: [VideoOwnerResponseDto] })
  items: VideoOwnerResponseDto[];
  @ApiProperty() pageNumber: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() totalCount: number;
  @ApiProperty() hasNextPage: boolean;

  constructor({
    items,
    pageNumber,
    pageSize,
    totalCount,
    hasNextPage,
  }: PaginatedVideosOwnerResponseDto) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(totalCount / pageSize);
    this.totalCount = totalCount;
    this.hasNextPage = hasNextPage;
  }
}
