import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
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
import { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { JwtUserPayload } from '../../user/user.service';
import { User } from '../../decorators/user-decorator';

const videoUploadStorage = diskStorage({
  destination: tmpdir(),
  filename: (req, file, cb) => {
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, filename);
  },
});

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
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'thumbnail' }, { name: 'video' }], {
      storage: videoUploadStorage,
    }),
    ChannelPreloadInterceptor,
  )
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @Channel() channel: ChannelRequestData,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ) {
    if (
      !files.video ||
      !files.video.length ||
      !files.thumbnail ||
      !files.thumbnail[0]
    ) {
      throw new BadRequestException('video and thumbnail files are required');
    }
    const videoServiceData = await this.videosService.create(
      channel.id,
      createVideoDto,
      files.video[0],
      files.thumbnail[0],
    );
    return new SuccessResponseShape(videoServiceData);
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
    type: VideoDetailsResponseDto,
  })
  async findOne(
    @Param('videoId') videoId: string,
    @Channel() channel: ChannelRequestData,
    @User() user: JwtUserPayload,
  ) {
    const videoData = await this.videosService.findOneVideoDetails(
      videoId,
      user.userId,
      true,
    );

    // This is the owner-only endpoint: reject if the video does not
    // actually belong to the authenticated user's channel, otherwise
    // any authenticated user could read another channel's unpublished
    // video details (including like/subscription state) by guessing ids.
    if (videoData.channel.id !== channel.id) {
      throw new ForbiddenException('video not owned by channel');
    }

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
}
