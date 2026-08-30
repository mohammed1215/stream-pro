import { ApiProperty } from '@nestjs/swagger';

class ChannelSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true }) channelImageUrl!: string | null;
  @ApiProperty() title!: string;
}

class VideoSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() thumbnailUrl!: string;
  @ApiProperty() durationSeconds!: number;
  @ApiProperty() views!: number;
  @ApiProperty({ type: ChannelSummaryDto }) channel!: ChannelSummaryDto;
}

export class WatchLaterItemDto {
  @ApiProperty() id!: string;
  @ApiProperty({ type: VideoSummaryDto }) video!: VideoSummaryDto;
  @ApiProperty() createdAt!: Date;
}

export class WatchLaterListDto {
  @ApiProperty({ type: [WatchLaterItemDto] })
  items!: WatchLaterItemDto[];
  @ApiProperty() videoCount!: number;
}
