import { ApiProperty } from '@nestjs/swagger';

export class GetChannelResponseDto {
  @ApiProperty({ type: String })
  id!: string;
  @ApiProperty({ type: String })
  title!: string;
  @ApiProperty({ type: String, nullable: true })
  description!: string | null;
  @ApiProperty({ type: String, nullable: true })
  thumbnailUrl!: string | null;
  @ApiProperty({ type: String, nullable: true })
  channelImageUrl!: string | null;
  @ApiProperty({ type: Date })
  createdAt!: Date;
  @ApiProperty({ type: String })
  updatedAt!: Date;
}

export class GetChannelResponseWrapperDto<Y> {
  @ApiProperty({ type: () => GetChannelResponseDto })
  data!: GetChannelResponseDto;

  @ApiProperty({ type: Object, nullable: true })
  meta!: Y;

  @ApiProperty({ enum: [true] })
  success!: true;
}
