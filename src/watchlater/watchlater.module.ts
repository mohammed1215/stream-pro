import { Module } from '@nestjs/common';
import { WatchlaterService } from './watchlater.service';
import { WatchlaterController } from './watchlater.controller';

@Module({
  controllers: [WatchlaterController],
  providers: [WatchlaterService],
})
export class WatchlaterModule {}
