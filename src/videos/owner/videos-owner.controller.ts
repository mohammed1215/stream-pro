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
  RawBodyRequest,
  Req,
  UnauthorizedException,
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
import { UploadCompletedDto } from '../dto/upload-completed.dto';
import { UploadCompletedResponseDto } from '../dto/responses/owner/upload-completed.dto';

const videoUploadStorage = memoryStorage();

@ApiTags('Owner-Videos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@UseInterceptors(ChannelPreloadInterceptor)
@Controller('owner/videos')
export class VideosOwnerController {
  constructor(private readonly videosService: VideosService) {}

  // ========================== Create Video ==========================
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        video: {
          type: 'string',
          format: 'binary',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'video', 'thumbnail', 'description'],
    },
  })
  @ApiCreatedResponse({ type: VideoCreatedResponseDto })
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @Channel() channel: ChannelRequestData,
  ) {
    const { duration, ...videoServiceData } = await this.videosService.create(
      channel.id,
      createVideoDto,
    );
    return new SuccessResponseShape({
      ...videoServiceData,
      durationSeconds: duration,
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

  @Get('upload-signature')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiOperation({ summary: 'get upload signature for video upload' })
  uploadSignature(
    @Channel() channel: ChannelRequestData,
    @Body('videoId') videoId: string,
  ) {
    const folder = `videos/${channel.id}`;
    return this.videosService.getUploadSignature(channel.id, videoId, folder);
  }

  @Post('video-upload-webhook')
  async updateVideoStatus(@Req() req: RawBodyRequest<Request>) {
    const timestamp = req.headers['x-cld-timestamp'];
    const signature = req.headers['x-cld-signature'];
    if (!timestamp || !signature) {
      throw new BadRequestException('Missing required headers');
    }
    const isValid = this.videosService.verifyNotificationSignature(
      req.rawBody,
      Number(timestamp),
      signature as string,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const payload = JSON.parse(req.rawBody!.toString());
    await this.videosService.handleUploadNotification(payload);
    return;
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

  // ======================== Update Video Thumbnail ==========================
  @Patch(':videoId/thumbnail')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    ChannelPreloadInterceptor,
    FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }], {
      storage: videoUploadStorage,
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: { type: 'string', format: 'binary' },
      },
      required: ['thumbnail'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video thumbnail updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Video thumbnail updated successfully',
        },
        videoId: { type: 'string' },
        channelId: { type: 'string' },
      },
    },
  })
  async updateVideoThumbnail(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
    @User() user: JwtUserPayload,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    if (!files.thumbnail || !files.thumbnail[0]) {
      throw new BadRequestException('thumbnail file is required');
    }
    await this.videosService.updateVideoThumbnail(
      videoId,
      channel.id,
      files.thumbnail[0],
      user.userId,
    );

    return {
      message: 'Video thumbnail updated successfully',
      videoId,
      channelId: channel.id,
    };
  }
  // ======================== Update Video Media ==========================
  @ApiConsumes('multipart/form-data')
  @Patch(':videoId/media')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    ChannelPreloadInterceptor,
    FileFieldsInterceptor([{ name: 'video', maxCount: 1 }], {
      storage: videoUploadStorage,
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: { type: 'string', format: 'binary' },
      },
      required: ['video'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video thumbnail updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Video media updated successfully',
        },
        videoId: { type: 'string' },
        channelId: { type: 'string' },
      },
    },
  })
  async updateVideoMedia(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
    @User() user: JwtUserPayload,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    if (!files.video || !files.video[0]) {
      throw new BadRequestException('video file is required');
    }
    await this.videosService.updateVideoMedia(
      videoId,
      channel.id,
      files.video[0],
      user.userId,
    );

    return {
      message: 'Video media updated successfully',
      videoId,
      channelId: channel.id,
    };
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

  @Post('upload-completed')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiResponse({
    status: 201,
    description: 'Video upload completed successfully',
    type: UploadCompletedResponseDto,
  })
  async uploadCompleted(
    @Body()
    uploadCompletedDto: UploadCompletedDto,
    @Channel() channel: ChannelRequestData,
  ) {
    return this.videosService.uploadCompleted(channel.id, uploadCompletedDto);
  }
}
