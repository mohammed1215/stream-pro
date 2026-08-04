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
import { ApiBody, ApiConsumes, ApiCreatedResponse } from '@nestjs/swagger';
import { VideoCreatedResponseDto } from './dto/create-video-response.dto';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const videoUploadStorage = diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => {
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, filename);
  },
});

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // ========================== Create Video ==========================
  @ApiConsumes('multipart/form-data') // 👈 ADD THIS
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
  @Post()
  @UseGuards(AuthGuard)
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

  @Get('channel/:channelId')
  getAllVideosOfChannel(
    @Param('channelId') channelId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.videosService.getAllVideosOfChannel(channelId, page, limit);
  }

  @Get('owner/channel')
  @UseGuards(AuthGuard)
  @UseInterceptors(ChannelPreloadInterceptor)
  getOwnerVideosOfChannel(
    @Channel() channel: ChannelRequestData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.videosService.getOwnerVideos(channel.id, page, limit);
  }
  // ========================== find one Video Details ==========================

  @Get(':videoId')
  async findOne(@Param('videoId') videoId: string) {
    const videoData = await this.videosService.findOneVideoDetails(videoId);
    return new SuccessResponseShape(videoData);
  }

  // ========================== update Video views ==========================
  @Post(':videoId/views')
  async recordView(@Param('videoId') videoId: string) {
    await this.videosService.updateViews(videoId);
    return new SuccessResponseShape({ recorded: true });
  }

  // ========================== Create Video ==========================

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(+id);
  }
  // ========================== Create Video ==========================
}
