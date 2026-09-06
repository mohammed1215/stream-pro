import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChannelPreloadInterceptor } from '../../interceptors/channel-preload.interceptor';
import { AuthGuard } from '../../user/guards/AuthGuard';
import { VideosService } from '../videos.service';
import { SuccessResponseShape } from '../../user/dto/ResponseShape.dto';
import { type ChannelRequestData } from '../../types/channel.types';
import { CreateVideoDto } from '../dto/create-video.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoCreatedResponseDto } from '../dto/create-video-response.dto';
import { Channel } from '../../decorators/channel-decorator';
import {
  PaginatedVideosOwnerResponseDto,
  VideoOwnerResponseDto,
} from '../dto/video-owner-response.dto';
import { VideoSortByEnum, VideoStatusEnum } from '../enum/enums';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { VideoDetailsResponseDto } from '../dto/video-details.dto';
import { JwtUserPayload } from '../../user/user.service';
import { User } from '../../decorators/user-decorator';
import { VideoDetailsOwnerResponseDto } from '../dto/responses/owner/get-video-details.dto';
import { memoryStorage } from 'multer';
import { VideoUploadCompletedDto } from '../dto/video-upload-completed.dto';
import { ThumbnailUploadCompletedDto } from '../dto/thumbnail-upload-completed.dto';

const videoUploadStorage = memoryStorage();

@ApiTags('Owner-Videos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(ChannelPreloadInterceptor)
@Controller('owner/videos')
export class VideosOwnerController {
  constructor(private readonly videosService: VideosService) {}

  // ========================== Create Video ==========================
  @ApiCreatedResponse({ type: VideoCreatedResponseDto })
  @Post('initiate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @Channel() channel: ChannelRequestData,
  ) {
    const { ...videoServiceData } = await this.videosService.create(
      channel.id,
      createVideoDto,
    );
    return new SuccessResponseShape({
      ...videoServiceData,
    });
  }

  // ========================== Find Videos ==========================

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
    type: PaginatedVideosOwnerResponseDto,
  })
  @ApiOperation({ summary: 'get owner channel videos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: VideoStatusEnum, required: false })
  @ApiQuery({ name: 'sortBy', enum: VideoSortByEnum, required: false })
  async getOwnerVideosOfChannel(
    @Channel() channel: ChannelRequestData,
    @Query(
      'page',
      new DefaultValuePipe(1),
      new ParseIntPipe({ optional: true }),
    )
    page: number = 1,
    @Query(
      'limit',
      new DefaultValuePipe(10),
      new ParseIntPipe({ optional: true }),
    )
    limit: number = 10,
    @Query(
      'status',
      new DefaultValuePipe(VideoStatusEnum.ALL),
      new ParseEnumPipe(VideoStatusEnum),
    )
    status: VideoStatusEnum = VideoStatusEnum.ALL,
    @Query(
      'sortBy',
      new DefaultValuePipe(VideoSortByEnum.NEWEST),
      new ParseEnumPipe(VideoSortByEnum),
    )
    sortBy: VideoSortByEnum = VideoSortByEnum.NEWEST,
  ) {
    const { videos, ...rest } = await this.videosService.getOwnerVideos(
      channel.id,
      page,
      limit,
      status,
      sortBy,
    );

    const videoList = videos.map((video) => {
      return new VideoOwnerResponseDto(
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
        video.isPublished,
        video.description,
        video.createdAt,
      );
    });
    return new PaginatedVideosOwnerResponseDto({
      items: videoList,
      pageNumber: page,
      pageSize: limit,
      ...rest,
    });
  }

  @Get(':videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Video details retrieved successfully',
    type: VideoDetailsOwnerResponseDto,
  })
  async findOne(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
    @User() user: JwtUserPayload,
  ) {
    return this.videosService.findOneVideoOwnerDetails(videoId, user.userId);
  }

  // ========================== Update Video Details ==========================
  @Patch(':videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Video details updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        video: { $ref: '#/components/schemas/VideoDetailsResponseDto' },
      },
    },
  })
  async updateVideoDetails(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
    @User() user: JwtUserPayload,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    const videoServiceData = await this.videosService.updateVideoDetails(
      videoId,
      channel.id,
      updateVideoDto,
      user.userId,
    );

    const videoDetails = new VideoDetailsResponseDto(
      videoServiceData.id,
      videoServiceData.title,
      videoServiceData.description,
      videoServiceData.videoUrl,
      videoServiceData.hlsUrl,
      videoServiceData.thumbnailUrl,
      videoServiceData.channel.id,
      videoServiceData.channel.title,
      videoServiceData.channel.channelImageUrl,
      videoServiceData.duration,
      videoServiceData.views,
      videoServiceData._count.comments,
      videoServiceData._count.likes,
      videoServiceData.channel._count.subscriptions,
      null,
      null,
      videoServiceData.createdAt,
    );

    return {
      message: 'video details updated successfully',
      video: videoDetails,
    };
  }

  // Publish Video
  @Patch(':videoId/change-publish-status')
  @ApiResponse({
    status: 200,
    description: 'Video publish status changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        videoId: { type: 'string' },
        channelId: { type: 'string' },
        isPublished: { type: 'boolean' },
      },
    },
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  async publishAndUnPublishVideo(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
  ) {
    const videoServiceData = await this.videosService.publishAndUnPublishVideo(
      videoId,
      channel.id,
    );
    return new SuccessResponseShape(videoServiceData);
  }

  // ==================== Video / Thumbnail upload completed ====================
  // Split into two endpoints - see VideosService for why. The old unified
  // `POST upload-completed` route was removed in favor of these.

  @Post(':videoId/video-upload-completed')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  async videoUploadCompleted(
    @Param('videoId') videoId: string,
    @Body() dto: VideoUploadCompletedDto,
    @Channel() channel: ChannelRequestData,
  ) {
    return this.videosService.videoUploadCompleted(channel.id, videoId, dto);
  }

  @Post(':videoId/thumbnail-upload-completed')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  async thumbnailUploadCompleted(
    @Param('videoId') videoId: string,
    @Body() dto: ThumbnailUploadCompletedDto,
    @Channel() channel: ChannelRequestData,
  ) {
    return this.videosService.thumbnailUploadCompleted(
      channel.id,
      videoId,
      dto,
    );
  }

  // ======================== Update Video Thumbnail ==========================
  @Patch(':videoId/thumbnail/signature')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Video thumbnail updated successfully',
  })
  getUpdateVideoThumbnailSignature(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
  ) {
    return this.videosService.getUpdateVideoThumbnailSignature(
      videoId,
      channel.id,
    );
  }

  // ======================== Update Video Media ==========================
  @ApiConsumes('multipart/form-data')
  @Patch(':videoId/media/signature')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  getUpdateVideoMediaSignature(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
  ) {
    return this.videosService.getUpdateVideoMediaSignature(videoId, channel.id);
  }

  // ========================== delete Video ==========================

  @Delete(':videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  async removeVideo(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
  ) {
    const videoServiceData = await this.videosService.removeVideo(
      videoId,
      channel.id,
    );
    return new SuccessResponseShape(videoServiceData);
  }
}
