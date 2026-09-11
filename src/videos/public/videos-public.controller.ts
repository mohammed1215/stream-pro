import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
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
import { RedisService } from '../../redis/redis.service';
import type { Request } from 'express';
import * as crypto from 'crypto';
@ApiTags('videos')
@Controller('videos')
export class VideosPublicController {
  constructor(
    private readonly videosService: VideosService,
    private readonly redisService: RedisService,
  ) {}

  // ========================== search video ==========================
  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'Videos searched successfully',
    type: PaginatedSearchVideoResponseDto,
  })
  async searchVideos(@Query() searchVideoDto: SearchVideoDto) {
    const { query, pageNumber = 1, pageSize = 10, category } = searchVideoDto;
    const { items, totalCount } = await this.videosService.searchVideos(
      query,
      pageNumber,
      pageSize,
      category,
    );
    const videoList = items.map((video) => {
      return new SearchVideoResponseDto(
        video.id,
        video.title,
        video.thumbnailUrl,
        video.duration,
        video.hlsUrl,
        video.videoUrl,
        video.views,
        video.channel.id,
        video.channel.title,
        video.channel.channelImageUrl,
        video.updatedAt,
      );
    });
    return new PaginatedSearchVideoResponseDto(
      videoList,
      pageSize,
      pageNumber,
      totalCount,
    );
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
        video.hlsUrl,
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
      videoData.hlsUrl,
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
      videoData.tags,
      videoData.createdAt,
    );
  }

  @Get(':videoId/related')
  @UseGuards(OptionalAuthGuard)
  async getRelatedVideos(
    @Param('videoId') videoId: string,
    @User() user?: JwtUserPayload,
  ): Promise<VideoResponseDto[]> {
    return this.videosService.getRelatedVideos(videoId);
  }

  // ========================== update Video views ==========================
  @Post(':videoId/views')
  @UseGuards(OptionalAuthGuard)
  async recordView(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @User() user?: JwtUserPayload,
  ) {
    const identifier = this.getViewerIdentifier(req, user);

    const isAllowed = await this.redisService.recordViewWithThrottle(
      videoId,
      identifier,
    );
    if (!isAllowed) {
      return { recorded: false, message: 'View already counted recently' };
    }
    await this.videosService.updateViews(videoId);
    return new SuccessResponseShape({ recorded: true });
  }

  private getViewerIdentifier(req: Request, user?: JwtUserPayload): string {
    if (user) {
      return `user:${user.userId}`;
    }
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket.remoteAddress || 'unknown-ip';
    const userAgent = req.headers['user-agent'] || 'unknown-ua';
    const hash = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');
    console.log(
      `Generated hash for IP ${ip} and User-Agent ${userAgent}: ${hash}`,
    );
    return `guest:${hash}`;
  }
}
