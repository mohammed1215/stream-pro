import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideoRepository } from './repositories/video.repository';
import { ChannelService } from '../channel/channel.service';
import { ChannelRepository } from '../channel/repositories/channel.repository';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import { VideosPublicController } from './public/videos-public.controller';
import { VideosOwnerController } from './owner/videos-owner.controller';
import { TagsModule } from '../tags/tags.module';

@Module({
  controllers: [VideosPublicController, VideosOwnerController],
  providers: [
    VideosService,
    VideoRepository,
    ChannelService,
    ChannelRepository,
    VideoProcessingService,
  ],
  exports: [VideosService, VideoRepository],
  imports: [TagsModule],
})
export class VideosModule {}
