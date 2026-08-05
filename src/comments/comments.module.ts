import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentRepository } from './repositories/comment.repository';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentRepository],
})
export class CommentsModule {}
