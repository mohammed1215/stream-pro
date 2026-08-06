import { Module } from '@nestjs/common';
import { WatchlaterService } from './watchlater.service';
import { WatchlaterController } from './watchlater.controller';
import { WatchlaterRepository } from './repositories/watchlater.repository';

@Module({
  controllers: [WatchlaterController],
  providers: [WatchlaterService, WatchlaterRepository],
})
export class WatchlaterModule {}
