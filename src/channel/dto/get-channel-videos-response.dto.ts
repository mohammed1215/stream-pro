export class ChannelVideoResponseDto {
  videoId: string;
  videoTitle: string;
  videoDescription: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  isLikedByUser: boolean;
  isInWatchLater: boolean;
  constructor(video: {
    videoId: string;
    videoTitle: string;
    videoDescription: string | null;
    videoUrl: string;
    thumbnailUrl: string | null;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    isLikedByUser: boolean;
    isInWatchLater: boolean;
  }) {
    this.videoId = video.videoId;
    this.videoTitle = video.videoTitle;
    this.videoDescription = video.videoDescription;
    this.videoUrl = video.videoUrl;
    this.thumbnailUrl = video.thumbnailUrl;
    this.views = video.views;
    this.createdAt = video.createdAt;
    this.updatedAt = video.updatedAt;
    this.isLikedByUser = video.isLikedByUser;
    this.isInWatchLater = video.isInWatchLater;
  }
}
export class PaginatedChannelVideosResponseDto {
  items: ChannelVideoResponseDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;

  constructor(paginatedData: {
    items: ChannelVideoResponseDto[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  }) {
    this.items = paginatedData.items;
    this.pageNumber = paginatedData.pageNumber;
    this.pageSize = paginatedData.pageSize;
    this.totalCount = paginatedData.totalCount;
    this.totalPages = paginatedData.totalPages;
    this.hasNextPage = paginatedData.hasNextPage;
  }
}
