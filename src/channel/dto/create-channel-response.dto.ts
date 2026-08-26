import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';

export class CreateChannelResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  // Explicitly state the type and that it can be null
  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true })
  channelImageUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  thumbnailUrl!: string | null;
}

export class ChannelCreatedResponseDto<Y> implements SuccessResponseShape<
  CreateChannelResponseDto,
  Y
> {
  @ApiProperty({ type: () => CreateChannelResponseDto })
  data!: CreateChannelResponseDto;

  @ApiProperty({ type: Object, nullable: true })
  meta!: Y;

  @ApiProperty({ enum: [true] })
  success!: true;
}
