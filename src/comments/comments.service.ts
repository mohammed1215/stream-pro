import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './repositories/comment.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../generated/prisma/browser';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepo: CommentRepository,
    private readonly notificationService: NotificationsService,
  ) {}
  async createComment(
    userId: string,
    videoId: string,
    createCommentDto: CreateCommentDto,
  ) {
    if (createCommentDto.parentId) {
      const parent = await this.commentRepo.findOne(createCommentDto.parentId);
      if (!parent || parent.isDeleted) {
        throw new BadRequestException('Parent comment does not exist');
      }

      if (parent.videoId !== videoId) {
        throw new BadRequestException(
          'Parent comment does not belong to this video',
        );
      }
      if (parent.parentId) {
        throw new BadRequestException('Replying to a reply is not allowed');
      }
    }
    const comment = await this.commentRepo.create(
      createCommentDto,
      userId,
      videoId,
    );

    //update counts
    if (comment.parentId) {
      this.commentRepo
        .update(comment.parentId, userId, { replyCount: { increment: 1 } })
        .catch((error) => {
          console.error('Failed to update reply count:', error);
        });
    }

    this.notificationService
      .create({
        actorId: userId,
        recipientId: comment.video.channel.userId,
        contextId: comment.id,
        message: comment.content,
        type: NotificationType.COMMENT,
      })
      .catch((error) => {
        console.error('Failed to send comment notification:', error);
      });

    return comment;
  }

  async findAllCommentsForVideo(
    videoId: string,
    page: number,
    limit: number,
    sort: 'asc' | 'desc',
  ) {
    return {
      comments: await this.commentRepo.findAll(
        { videoId, parentId: null },
        page,
        limit,
        sort,
      ),
      totalPages: Math.ceil(
        (await this.commentRepo.countComments({ videoId })) / limit,
      ),
    };
  }
  findAllRepliesOfComment(commentId: string) {
    return this.commentRepo.findAllRepliesOfComment(commentId, 1, 100, 'desc');
  }
  findOne(commentId: string) {
    return this.commentRepo.findOne(commentId);
  }

  async getRecentCommentsForChannel(
    userId: string,
    pageNumber = 1,
    pageSize = 10,
  ) {
    if (pageNumber < 1) {
      throw new BadRequestException('pageNumber must be positive');
    }
    if (pageSize < 1) {
      throw new BadRequestException('pageSize must be positive');
    }
    const comments = await this.commentRepo.findAllCommentsWithSpecificSelect(
      userId,
      pageNumber,
      pageSize,
    );

    const count = await this.commentRepo.countComments({
      userId,
      isDeleted: false,
    });
    return { comments, count };
  }

  update(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentRepo.update(commentId, userId, updateCommentDto);
  }

  remove(commentId: string, userId: string) {
    return this.commentRepo.remove(commentId, userId);
  }
}
