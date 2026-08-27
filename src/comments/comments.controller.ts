import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../user/guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto/comment-response.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Comment has been created Successfully',
        },
      },
    },
  })
  async create(
    @Param('videoId') videoId: string,
    @User() user: JwtUserPayload,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createComment(
      user.userId,
      videoId,
      createCommentDto,
    );

    return {
      message: 'Comment has been created Successfully',
      commentId: comment.id,
      content: comment.content,
      isEditted: comment.isEditted,
    };
  }

  @Get(':videoId')
  @ApiResponse({
    type: PaginatedCommentsResponseDto,
  })
  async findAllCommentsForVideo(
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe()) page: number,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe()) limit: number,
    @Param('videoId') videoId: string,
    @Query('sort', new DefaultValuePipe('desc')) sort: 'asc' | 'desc',
  ) {
    const { comments, totalPages } =
      await this.commentsService.findAllCommentsForVideo(
        videoId,
        page,
        limit,
        sort,
      );

    const commentList = comments.map(
      (comment) =>
        new CommentResponseDto(
          comment.id,
          comment.content,
          comment.isEditted,
          comment.userId,
          comment.user.name,
          comment.user.avatarUrl,
          comment.createdAt,
        ),
    );

    return new PaginatedCommentsResponseDto(
      commentList,
      page,
      limit,
      totalPages,
      page < totalPages,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentsService.findOne(id);
  // }

  @Patch(':commentId')
  @UseGuards(AuthGuard)
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Comment has been updated successfully',
        },
      },
    },
  })
  async update(
    @Param('commentId') commentId: string,
    @User() user: JwtUserPayload,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    await this.commentsService.update(commentId, user.userId, updateCommentDto);
    return { message: 'Comment has been updated successfully' };
  }

  @Delete(':commentId')
  @ApiBearerAuth()
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Comment has been deleted successfully',
        },
      },
    },
  })
  @UseGuards(AuthGuard)
  async remove(
    @Param('commentId') commentId: string,
    @User() user: JwtUserPayload,
  ) {
    await this.commentsService.remove(commentId, user.userId);
    return { message: 'Comment has been deleted successfully' };
  }
}
