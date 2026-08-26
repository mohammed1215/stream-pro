import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideoRepository } from './repositories/video.repository';
import { ChannelService } from 'src/channel/channel.service';
import { ChannelRepository } from 'src/channel/repositories/channel.repository';
import { VideoProcessingService } from 'src/video-processing/video-processing.service';
import { VideosPublicController } from './public/videos-public.controller';
import { VideosOwnerController } from './owner/videos-owner.controller';

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
})
export class VideosModule {}
