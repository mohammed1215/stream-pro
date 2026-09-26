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
  NotFoundException,
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
import { PaginatedGetRecentCommentsForChannel } from './dto/responses/get-recent-comments-for-channel.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiResponse({
    description:
      "returns the recent comments for channel of the owner's channel",
  })
  @UseGuards(AuthGuard)
  async getRecentCommentsForChannel(
    @User() user: JwtUserPayload,
    @Query(
      'pageSize',
      new DefaultValuePipe(1),
      new ParseIntPipe({ optional: true }),
    )
    pageSize: number = 10,
    @Query(
      'pageNumber',
      new DefaultValuePipe(1),
      new ParseIntPipe({ optional: true }),
    )
    pageNumber: number = 1,
  ): Promise<PaginatedGetRecentCommentsForChannel> {
    const { comments, count } =
      await this.commentsService.getRecentCommentsForChannel(
        user.userId,
        pageNumber,
        pageSize,
      );

    const totalPages = Math.ceil(count / pageSize);

    return {
      items: comments,
      pageNumber,
      pageSize,
      totalPages,
      totalCount: count,
      hasNextPage: totalPages !== pageNumber,
      hasPreviousPage: pageNumber !== 1,
    };
  }

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
          comment.videoId,
          comment.user.name,
          comment.user.avatarUrl,
          comment.createdAt,
          comment.replyCount,
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

  @Get(':commentId/replies')
  @ApiResponse({
    type: [CommentResponseDto],
  })
  async findRepliesOfComment(
    @Param('commentId') commentId: string,
  ): Promise<CommentResponseDto[]> {
    const comment =
      await this.commentsService.findAllRepliesOfComment(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment.map((c) => ({
      commentId: c.id,
      content: c.content,
      isEditted: c.isEditted,
      userId: c.userId,
      videoId: c.videoId,
      userName: c.user.name,
      userProfileImage: c.user.avatarUrl,
      createdAt: c.createdAt,
      replyCount: c.replyCount,
    }));
  }

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
