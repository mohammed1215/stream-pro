import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoResponseDto {
  @ApiProperty({ type: String })
  description!: string;
  @ApiProperty({ type: String })
  title!: string;
  @ApiProperty({ type: String })
  id!: string;
  @ApiProperty({ type: Date })
  createdAt!: Date;
  @ApiProperty({ type: Date })
  updatedAt!: Date;
  @ApiProperty({ type: Number })
  durationSeconds!: number;
  @ApiProperty({ type: Number })
  size!: bigint;
  @ApiProperty({ type: Boolean })
  isPublished!: boolean;
}
export class VideoCreatedResponseDto {
  @ApiProperty({ type: () => CreateVideoResponseDto })
  data!: CreateVideoResponseDto;

  @ApiProperty({ type: Object, nullable: true })
  meta!: object;

  @ApiProperty({ enum: [true] })
  success!: true;
}
