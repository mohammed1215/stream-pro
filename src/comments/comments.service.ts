import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './repositories/comment.repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentRepo: CommentRepository) {}
  createComment(
    userId: string,
    videoId: string,
    createCommentDto: CreateCommentDto,
  ) {
    return this.commentRepo.create({
      ...createCommentDto,
      user: { connect: { id: userId } },
      video: { connect: { id: videoId } },
    });
  }

  findAllCommentsForVideo(videoId: string, page: number, limit: number) {
    return this.commentRepo.findAll({ videoId }, page, limit);
  }

  findOne(commentId: string) {
    return this.commentRepo.findOne(commentId);
  }

  update(commentId: string, updateCommentDto: UpdateCommentDto) {
    return this.commentRepo.update(commentId, updateCommentDto);
  }

  remove(commentId: string) {
    return this.commentRepo.remove(commentId);
  }
}
