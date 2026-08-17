import { ApiProperty } from '@nestjs/swagger';

export class FindPlaylistWithVideoResponseDto {
  @ApiProperty() playlistId: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isPublic: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() hasVideo: boolean;

  constructor(
    playlistId: string,
    title: string,
    description: string | null,
    isPublic: boolean,
    createdAt: Date,
    updatedAt: Date,
    hasVideo: boolean,
  ) {
    this.playlistId = playlistId;
    this.title = title;
    this.description = description;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.hasVideo = hasVideo;
  }
}

export class PaginatedFindPlaylistWithVideoResponseDto {
  @ApiProperty({ type: [FindPlaylistWithVideoResponseDto] })
  items: FindPlaylistWithVideoResponseDto[];
  @ApiProperty() totalCount: number;
  @ApiProperty() pageNumber: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() hasNextPage: boolean;

  constructor(
    items: FindPlaylistWithVideoResponseDto[],
    totalCount: number,
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    hasNextPage: boolean,
  ) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
  }
}
