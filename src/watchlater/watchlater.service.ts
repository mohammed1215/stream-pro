import { Injectable } from '@nestjs/common';
import { CreateWatchlaterDto } from './dto/create-watchlater.dto';
import { UpdateWatchlaterDto } from './dto/update-watchlater.dto';
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

  findAll() {
    return `This action returns all watchlater`;
  }

  findOne(id: number) {
    return `This action returns a #${id} watchlater`;
  }

  update(id: number, updateWatchlaterDto: UpdateWatchlaterDto) {
    return `This action updates a #${id} watchlater`;
  }

  removeFromWatchLater(userId: string, watchLaterId: string) {
    return this.watchLaterRepo.removeFromWatchLater(userId, watchLaterId);
  }
}
