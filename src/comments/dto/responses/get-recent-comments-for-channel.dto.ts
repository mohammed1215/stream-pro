import { ApiProperty } from '@nestjs/swagger';

export class VideoShape {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() thumbnailUrl!: string | null;
}
export class GetRecentCommentsForChannel {
  @ApiProperty() id!: string;
  @ApiProperty() content!: string;
  @ApiProperty() user!: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty() video!: VideoShape;
}

export class PaginatedGetRecentCommentsForChannel {
  @ApiProperty() items!: GetRecentCommentsForChannel[];
  @ApiProperty() pageNumber!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() totalPages!: number;
  @ApiProperty() totalCount!: number;
  @ApiProperty() hasNextPage!: boolean;
  @ApiProperty() hasPreviousPage!: boolean;
}
