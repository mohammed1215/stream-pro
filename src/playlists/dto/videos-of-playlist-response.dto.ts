import { ApiProperty } from '@nestjs/swagger';

export class VideoOfPlaylistResponseDto {
  @ApiProperty() videoId: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() thumbnailUrl: string | null;
  @ApiProperty() indexOfVideo: number;
  @ApiProperty() playlistId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() durationSeconds: number;

  constructor(
    videoId: string,
    title: string,
    description: string,
    thumbnailUrl: string | null,
    indexOfVideo: number,
    playlistId: string,
    createdAt: Date,
    durationSeconds: number,
  ) {
    this.videoId = videoId;
    this.title = title;
    this.description = description;
    this.thumbnailUrl = thumbnailUrl;
    this.indexOfVideo = indexOfVideo;
    this.playlistId = playlistId;
    this.createdAt = createdAt;
    this.durationSeconds = durationSeconds;
  }
}

export class PaginatedVideoOfPlaylistResponseDto {
  @ApiProperty({ type: [VideoOfPlaylistResponseDto] })
  items: VideoOfPlaylistResponseDto[];
  @ApiProperty() totalCount: number;
  @ApiProperty() pageNumber: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() hasNextPage: boolean;
  @ApiProperty() isPublic: boolean;

  constructor(
    items: VideoOfPlaylistResponseDto[],
    totalCount: number,
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    hasNextPage: boolean,
    isPublic: boolean,
  ) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
    this.isPublic = isPublic;
  }
}
