// dto/watch-history-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class VideoSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() thumbnailUrl!: string;
  @ApiProperty() durationSeconds!: number;
}

class ChannelSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ nullable: true }) channelImageUrl!: string | null;
}

export class WatchHistoryItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() watchedSeconds!: number;
  @ApiProperty() videoDuration!: number;
  @ApiProperty() completionRate!: number;
  @ApiProperty() lastWatchedAt!: Date;
  @ApiProperty({ type: VideoSummaryDto }) video!: VideoSummaryDto;
  @ApiProperty({ type: ChannelSummaryDto }) channel!: ChannelSummaryDto;
}

// dto/grouped-watch-history.dto.ts
export class GroupedWatchHistoryDto {
  @ApiProperty({ example: 'Today' })
  label!: string;

  @ApiProperty({ type: [WatchHistoryItemDto] })
  items!: WatchHistoryItemDto[];
}
