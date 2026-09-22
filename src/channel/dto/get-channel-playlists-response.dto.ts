import { ApiProperty } from '@nestjs/swagger';

export class GetChannelPlaylistResponseDto {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  videosCount: number;
  @ApiProperty({
    type: 'array',
    items: { type: 'string', nullable: true },
    nullable: true,
    description:
      'Array of thumbnail URLs (each item can be null if not generated yet)',
  })
  thumbnails: null | (string | null)[];
  constructor({
    id,
    title,
    description,
    createdAt,
    updatedAt,
    isPublic,
    videosCount,
    thumbnails,
  }: GetChannelPlaylistResponseDto) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isPublic = isPublic;
    this.videosCount = videosCount;
    this.thumbnails = thumbnails;
  }
}

export class PaginatedChannelPlaylistsResponseDto {
  items: GetChannelPlaylistResponseDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;

  constructor({
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasNextPage,
  }: PaginatedChannelPlaylistsResponseDto) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
  }
}
