import { Injectable } from '@nestjs/common';
import { CreateWatchlaterDto } from './dto/create-watchlater.dto';
import { WatchlaterRepository } from './repositories/watchlater.repository';

@Injectable()
export class WatchlaterService {
  constructor(private readonly watchLaterRepo: WatchlaterRepository) {}
  async addToWatchLater(
    userId: string,
    createWatchlaterDto: CreateWatchlaterDto,
  ) {
    return this.watchLaterRepo.addToWatchLater({
      ...createWatchlaterDto,
      userId,
    });
  }

  async findAllByUserId(userId: string, cursor?: string, limit = 20) {
    const items = await this.watchLaterRepo.findAllByUserId(
      userId,
      cursor,
      limit,
    );
    const videoCount =
      await this.watchLaterRepo.countWatchLaterByUserId(userId);
    return { items, videoCount };
  }

  async isVideoSaved(userId: string, videoId: string) {
    const item = await this.watchLaterRepo.findOne(userId, videoId);
    return { isSaved: !!item, watchLaterId: item?.id ?? null };
  }

  removeFromWatchLater(userId: string, videoId: string) {
    return this.watchLaterRepo.removeFromWatchLater(userId, videoId);
  }
  async checkWatchLaterStatus(userId: string, videoId: string) {
    return {
      isInWatchLater: await this.watchLaterRepo.checkWatchLaterStatus(
        userId,
        videoId,
      ),
    };
  }
}
