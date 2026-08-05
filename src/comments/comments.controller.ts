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
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { ApiResponse } from '@nestjs/swagger';
import {
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto/comment-response.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':videoId')
  @UseGuards(AuthGuard)
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
  ) {
    const comments = await this.commentsService.findAllCommentsForVideo(
      videoId,
      page,
      limit,
    );

    const commentList = comments.map(
      (comment) =>
        new CommentResponseDto(comment.id, comment.content, comment.isEditted),
    );

    return new PaginatedCommentsResponseDto(commentList, page, limit);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentsService.findOne(id);
  // }

  @Patch(':commentId')
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
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    await this.commentsService.update(commentId, updateCommentDto);
    return { message: 'Comment has been updated successfully' };
  }

  @Delete(':commentId')
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
  async remove(@Param('commentId') commentId: string) {
    await this.commentsService.remove(commentId);
    return { message: 'Comment has been deleted successfully' };
  }
}
