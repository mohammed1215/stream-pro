import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikeRepository } from './repositories/like.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [LikesController],
  providers: [LikesService, LikeRepository],
  imports: [NotificationsModule],
})
export class LikesModule {}
