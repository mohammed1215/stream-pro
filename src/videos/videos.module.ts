import { forwardRef, Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideoRepository } from './repositories/video.repository';
import { ChannelService } from '../channel/channel.service';
import { ChannelRepository } from '../channel/repositories/channel.repository';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import { VideosPublicController } from './public/videos-public.controller';
import { VideosOwnerController } from './owner/videos-owner.controller';
import { TagsModule } from '../tags/tags.module';
import { RedisModule } from '../redis/redis.module';
import { VideosInternalController } from './videos.controller';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { DownloadRepository } from './repositories/download.repository';
import { SearchModule } from '../search/search.module';

@Module({
  controllers: [
    VideosPublicController,
    VideosOwnerController,
    VideosInternalController,
    DownloadsController,
  ],
  providers: [
    VideosService,
    VideoRepository,
    ChannelService,
    ChannelRepository,
    VideoProcessingService,
    DownloadsService,
    DownloadRepository,
  ],
  exports: [VideosService, VideoRepository],
  imports: [TagsModule, RedisModule, forwardRef(() => SearchModule)],
})
export class VideosModule {}
