import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './repositories/comment.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/generated/prisma/browser';

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
    const comment = await this.commentRepo.create({
      ...createCommentDto,
      user: { connect: { id: userId } },
      video: { connect: { id: videoId } },
    });

    await this.notificationService.create({
      actorId: userId,
      recipientId: comment.video.channel.userId,
      contextId: comment.id,
      message: comment.content,
      type: NotificationType.COMMENT,
    });

    return comment;
  }

  findAllCommentsForVideo(videoId: string, page: number, limit: number) {
    return this.commentRepo.findAll({ videoId }, page, limit);
  }

  findOne(commentId: string) {
    return this.commentRepo.findOne(commentId);
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
