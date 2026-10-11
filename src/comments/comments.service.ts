import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
      await this.commentRepo.incrementReplyCount(comment.parentId);
      this.notificationService
        .create({
          actorId: userId,
          recipientId: comment.parent?.userId || '',
          commentId: comment.id,
          videoId,
          message: `${comment.user.name} replied to your comment with:${comment.content}`,
          type: NotificationType.REPLY,
        })
        .catch((error) => {
          console.error('Failed to send comment notification:', error);
        });
    }

    this.notificationService
      .create({
        actorId: userId,
        recipientId: comment.video.channel.userId,
        commentId: comment.id,
        videoId,
        message: comment.content,
        type: NotificationType.COMMENT,
      })
      .catch((error) => {
        console.error('Failed to send comment notification:', error);
      });

    return comment;
  }

  // async locateComment(
  //   commentId: string,
  //   sort: 'desc' | 'asc',
  //   pageSize: string,
  // ) {
  //   const comment = await this.commentRepo.findOne(commentId);

  //   if (!comment) throw new NotFoundException('Comment not found');

  //   const kind = comment.parentId ? 'reply' : 'comment';
  //   if (kind === 'reply') {
  //     //find the parentIndex and parentPageNumber
  //     let parentIndex = 0;
  //     let parentPageNumber = 1;

  //     // Find the parent comment's index and page number
  //     const parentComments = await this.commentRepo.findAll(
  //       { videoId: comment.videoId, parentId: null },
  //       1,
  //       parseInt(pageSize),
  //       sort,
  //     );

  //     return {
  //       kind,
  //       videoId: comment.videoId,
  //       parentId: comment.parentId,
  //       parentPageNumber: 2,
  //       parentIndex: 4,
  //       replyPageNumber: 1,
  //       replyIndex: 0,
  //     };
  //   }
  //   return {
  //     kind,
  //     videoId: comment.videoId,
  //     pageNumber: 6,
  //     index: 3,
  //   };
  // }

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

  async remove(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne(commentId);
    if (comment?.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }
    const result = await this.commentRepo.remove(commentId, userId);
    if (result && comment.parentId) {
      await this.commentRepo.decrementReplyCount(comment.parentId);
    }
    return result;
  }
}
