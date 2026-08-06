import { ApiProperty } from '@nestjs/swagger';

export class SearchVideoResponseDto {
  @ApiProperty() videoId: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() thumbnailUrl: string;
  @ApiProperty() duration: number;
  @ApiProperty() videoUrl: string;
  @ApiProperty() channelId: string;
  @ApiProperty() channelName: string;
  @ApiProperty() channelProfileImageUrl: string;

  constructor(
    videoId: string,
    title: string,
    description: string,
    thumbnailUrl: string,
    duration: number,
    videoUrl: string,
    channelId: string,
    channelName: string,
    channelProfileImageUrl: string,
  ) {
    this.videoId = videoId;
    this.title = title;
    this.description = description;
    this.thumbnailUrl = thumbnailUrl;
    this.duration = duration;
    this.videoUrl = videoUrl;
    this.channelId = channelId;
    this.channelName = channelName;
    this.channelProfileImageUrl = channelProfileImageUrl;
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
