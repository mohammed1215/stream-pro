import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikeRepository } from './repositories/like.repository';

@Module({
  controllers: [LikesController],
  providers: [LikesService, LikeRepository],
})
export class LikesModule {}
