import { Injectable } from '@nestjs/common';
import { CreateWatchlaterDto } from './dto/create-watchlater.dto';
import { UpdateWatchlaterDto } from './dto/update-watchlater.dto';

@Injectable()
export class WatchlaterService {
  create(createWatchlaterDto: CreateWatchlaterDto) {
    return 'This action adds a new watchlater';
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

  remove(id: number) {
    return `This action removes a #${id} watchlater`;
  }
}
