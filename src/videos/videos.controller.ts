import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  ParseIntPipe,
  UploadedFiles,
  BadRequestException,
  DefaultValuePipe,
  Patch,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AuthGuard } from '../user/guards/AuthGuard';
import { Channel } from '../decorators/channel-decorator';
import { type ChannelRequestData } from '../types/channel.types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';
import { ChannelPreloadInterceptor } from '../interceptors/channel-preload.interceptor';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { VideoCreatedResponseDto } from './dto/create-video-response.dto';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { tmpdir } from 'os';
import {
  PaginatedVideosResponseDto,
  VideoResponseDto,
} from './dto/video-response.dto';
import { VideoDetailsResponseDto } from './dto/video-details.dto';
import {
  PaginatedVideosOwnerResponseDto,
  VideoOwnerResponseDto,
} from './dto/video-owner-response.dto';
import { SearchVideoDto } from './dto/search-video.dto';
import {
  PaginatedSearchVideoResponseDto,
  SearchVideoResponseDto,
} from './dto/search-video-response.dto';
import { VideoQueryDto } from './dto/video-query.dto';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { OptionalAuthGuard } from 'src/user/guards/OptionalAuthGuard';

const videoUploadStorage = diskStorage({
  destination: tmpdir(),
  filename: (req, file, cb) => {
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, filename);
  },
});

@Controller()
export class VideosController {
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
      required: ['title', 'video', 'thumbnail', 'description'], // adjust as needed
    },
  })
  @ApiCreatedResponse({ type: VideoCreatedResponseDto })
  @Post('owner/videos')
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

  @Get('videos/channel/:channelId')
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

  @Get('owner/channel/videos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ChannelPreloadInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Videos retrieved successfully',
    type: PaginatedVideosOwnerResponseDto,
  })
  async getOwnerVideosOfChannel(
    @Channel() channel: ChannelRequestData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const { videos, ...rest } = await this.videosService.getOwnerVideos(
      channel.id,
      page,
      limit,
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

  // ========================== search video ==========================
  @Get('videos/search')
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

  // ========================== find one Video Details ==========================

  //TODO: Allow not logged in users to view video details, but without isSubscribed property
  // we will have to make Guard optional for this route
  @Get('videos/:videoId')
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
  @Post('videos/:videoId/views')
  async recordView(@Param('videoId') videoId: string) {
    await this.videosService.updateViews(videoId);
    return new SuccessResponseShape({ recorded: true });
  }

  // Publish Video
  @Patch('owner/videos/:videoId/change-publish-status')
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

  // ========================== delete Video ==========================

  @Delete('owner/videos/:videoId')
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
  // ========================== Update Video Details ==========================
  @Patch('owner/videos/:videoId')
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
    updateVideoDto: UpdateVideoDto,
  ) {
    const videoServiceData = await this.videosService.updateVideoDetails(
      videoId,
      channel.id,
      updateVideoDto,
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

  // ======================== Update Video Thumbnail ==========================
  @Patch('owner/videos/:videoId/thumbnail')
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
    );

    return {
      message: 'Video thumbnail updated successfully',
      videoId,
      channelId: channel.id,
    };
  }

  // ======================== Update Video Media ==========================
  @ApiConsumes('multipart/form-data')
  @Patch('owner/videos/:videoId/media')
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
    );

    return {
      message: 'Video media updated successfully',
      videoId,
      channelId: channel.id,
    };
  }
}
