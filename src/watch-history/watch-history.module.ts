import { Module } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';
import { WatchHistoryRespository } from './repositories/watch-history.respository';
import { VideosModule } from '../videos/videos.module';

@Module({
  controllers: [WatchHistoryController],
  providers: [WatchHistoryService, WatchHistoryRespository],
  imports: [VideosModule],
})
export class WatchHistoryModule {}
