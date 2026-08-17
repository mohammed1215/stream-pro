export class GetChannelPlaylistResponseDto {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  videosCount: number;
  constructor({
    id,
    title,
    description,
    createdAt,
    updatedAt,
    isPublic,
    videosCount,
  }: GetChannelPlaylistResponseDto) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isPublic = isPublic;
    this.videosCount = videosCount;
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
