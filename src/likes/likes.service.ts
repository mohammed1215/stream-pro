import { Injectable } from '@nestjs/common';
// import { CreateLikeDto } from './dto/create-like.dto';
// import { UpdateLikeDto } from './dto/update-like.dto';
import { LikeRepository } from './repositories/like.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/generated/prisma/enums';

@Injectable()
export class LikesService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly notificationService: NotificationsService,
  ) {}
  async createLike(userId: string, videoId: string) {
    const like = await this.likeRepository.createLike(userId, videoId);
    await this.notificationService.create({
      actorId: userId,
      recipientId: like.video.channel.userId,
      contextId: like.videoId,
      message: `User ${like.user.name} liked your video ${like.video.title}`,
      type: NotificationType.LIKE,
    });

    return like;
  }

  async findAllLikedVideos(userId: string, cursor?: string, limit = 20) {
    const items = await this.likeRepository.findAllLikedVideos(
      userId,
      cursor,
      limit,
    );

    const videoCount = await this.likeRepository.countLikedVideos(userId);
    return { items, videoCount };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} like`;
  // }

  // update(id: number, updateLikeDto: UpdateLikeDto) {
  //   return `This action updates a #${id} like`;
  // }

  removeLike(userId: string, videoId: string) {
    return this.likeRepository.removeLike(userId, videoId);
  }
}
