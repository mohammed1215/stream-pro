import { ApiProperty } from '@nestjs/swagger';

export class PlaylistResponseDto {
  @ApiProperty() playlistId: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isPublic: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(
    playlistId: string,
    title: string,
    description: string | null,
    isPublic: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.playlistId = playlistId;
    this.title = title;
    this.description = description;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
