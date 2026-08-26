import { ApiProperty } from '@nestjs/swagger';

class ChannelSummary {
  id!: string;
  title!: string;
  channelImageUrl!: string | null;
}
class VideoSummary {
  id!: string;
  createdAt!: Date;
  channel!: ChannelSummary;
  title!: string;
  duration!: number;
  @ApiProperty({ nullable: true }) thumbnailUrl!: string | null;
  views!: number;
}

export class LikeItemDto {
  id!: string;
  createdAt!: Date;
  video!: VideoSummary;
}

export class LikeResponseDto {
  items!: LikeItemDto[];
  videoCount!: number;
}
