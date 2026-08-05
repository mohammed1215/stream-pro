import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty() commentId!: string;
  @ApiProperty() content!: string;
  @ApiProperty() isEditted!: boolean;
  constructor(id: string, content: string, isEditted: boolean) {
    this.commentId = id;
    this.content = content;
    this.isEditted = isEditted;
  }
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({ type: [CommentResponseDto] }) items!: CommentResponseDto[];
  @ApiProperty() pageNumber!: number;
  @ApiProperty() pageSize!: number;

  constructor(
    items: CommentResponseDto[],
    pageNumber: number,
    pageSize: number,
  ) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
