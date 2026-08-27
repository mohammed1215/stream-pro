import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty() commentId!: string;
  @ApiProperty() content!: string;
  @ApiProperty() isEditted!: boolean;
  @ApiProperty() userId!: string;
  @ApiProperty() userName!: string;
  @ApiProperty({ nullable: true }) userProfileImage!: string | null;
  @ApiProperty() createdAt!: Date;

  constructor(
    id: string,
    content: string,
    isEditted: boolean,
    userId: string,
    userName: string,
    userProfileImage: string | null,
    createdAt: Date,
  ) {
    this.commentId = id;
    this.content = content;
    this.isEditted = isEditted;
    this.userId = userId;
    this.userName = userName;
    this.userProfileImage = userProfileImage;
    this.createdAt = createdAt;
  }
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({ type: [CommentResponseDto] }) items!: CommentResponseDto[];
  @ApiProperty() pageNumber!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() totalPages!: number;
  @ApiProperty() hasNextPage!: boolean;

  constructor(
    items: CommentResponseDto[],
    pageNumber: number,
    pageSize: number,
    totalPages: number,
    hasNextPage: boolean,
  ) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
  }
}
