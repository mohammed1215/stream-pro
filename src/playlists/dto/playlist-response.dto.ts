import { ApiProperty } from '@nestjs/swagger';

export class PlaylistResponseDto {
  @ApiProperty() playlistId: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isPublic: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() videoCount: number;
  @ApiProperty({ nullable: true }) thumbnailUrl?: string | null;
  @ApiProperty({ nullable: true }) firstVideoId?: string | null;

  constructor(
    playlistId: string,
    title: string,
    description: string | null,
    isPublic: boolean,
    createdAt: Date,
    updatedAt: Date,
    videoCount: number,
    thumbnailUrl?: string | null,
    firstVideoId?: string | null,
  ) {
    this.playlistId = playlistId;
    this.title = title;
    this.description = description;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.videoCount = videoCount;
    this.thumbnailUrl = thumbnailUrl;
    this.firstVideoId = firstVideoId;
  }
}
