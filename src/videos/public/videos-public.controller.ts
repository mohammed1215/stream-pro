import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VideosService } from '../videos.service';
import { SearchVideoDto } from '../dto/search-video.dto';
import { VideoQueryDto } from '../dto/video-query.dto';
import { OptionalAuthGuard } from '../../user/guards/OptionalAuthGuard';
import { User } from '../../decorators/user-decorator';
import { JwtUserPayload } from '../../user/user.service';
import {
  PaginatedSearchVideoResponseDto,
  SearchVideoResponseDto,
} from '../dto/search-video-response.dto';
import {
  PaginatedVideosResponseDto,
  VideoResponseDto,
} from '../dto/video-response.dto';
import { VideoDetailsResponseDto } from '../dto/video-details.dto';
import { SuccessResponseShape } from '../../user/dto/ResponseShape.dto';

@ApiTags('videos')
@Controller('videos')
export class VideosPublicController {
  constructor(private readonly videosService: VideosService) {}

  // ========================== search video ==========================
  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Videos searched successfully',
    type: PaginatedSearchVideoResponseDto,
  })
  async searchVideos(@Query() searchVideoDto: SearchVideoDto) {
    const { query, pageNumber = 1, pageSize = 10 } = searchVideoDto;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items, totalCount } = await this.videosService.searchVideos(
      query,
      pageNumber,
      pageSize,
    );
    const videoList = items.map((video) => {
      return new SearchVideoResponseDto(
        video.id,
        video.title,
        video.thumbnailUrl,
        video.duration,
        video.videoUrl,
        video.views,
        video.channel.id,
        video.channel.title,
        video.channel.channelImageUrl,
        video.updatedAt,
      );
    });
    return new PaginatedSearchVideoResponseDto(videoList, pageNumber, pageSize);
  }

  @Get('channel/:channelId')
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
    type: PaginatedVideosResponseDto,
  })
  async getAllVideosOfChannel(
    @Param('channelId') channelId: string,
    @Query() videoQueryDto: VideoQueryDto,
  ) {
    const { pageNumber = 1, pageSize = 10, sortBy } = videoQueryDto;
    const videos = await this.videosService.getAllVideosOfChannel(
      channelId,
      pageNumber,
      pageSize,
      sortBy,
    );

    // Map the request
    const videoList = videos.map((video) => {
      return new VideoResponseDto(
        video.id,
        video.title,
        video.videoUrl,
        video.thumbnailUrl,
        video.channel.id,
        video.channel.title,
        video.channel.channelImageUrl,
        video.duration,
        video.views,
      );
    });

    return new PaginatedVideosResponseDto(videoList, pageNumber, pageSize);
  }
  // ========================== find one Video Details ==========================

  //TODO: Allow not logged in users to view video details, but without isSubscribed property
  // we will have to make Guard optional for this route
  @Get(':videoId')
  @UseGuards(OptionalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Video details retrieved successfully',
    type: VideoDetailsResponseDto,
  })
  async findOne(
    @Param('videoId') videoId: string,
    @User() user?: JwtUserPayload,
  ) {
    const videoData = await this.videosService.findOneVideoDetails(
      videoId,
      user?.userId,
    );
    const channelDetails = videoData.channel;

    return new VideoDetailsResponseDto(
      videoData.id,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      channelDetails.id,
      channelDetails.title,
      channelDetails.channelImageUrl,
      videoData.duration,
      videoData.views,
      videoData._count.comments,
      videoData._count.likes,
      channelDetails._count.subscriptions,
      channelDetails.isSubscribed,
      videoData.isLikedByUser,
      videoData.createdAt,
    );
  }

  // ========================== update Video views ==========================
  @Post(':videoId/views')
  async recordView(@Param('videoId') videoId: string) {
    await this.videosService.updateViews(videoId);
    return new SuccessResponseShape({ recorded: true });
  }
}
