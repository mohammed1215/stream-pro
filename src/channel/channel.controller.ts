import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthGuard } from '../user/guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';
import {
  ChannelCreatedResponseDto,
  CreateChannelResponseDto,
} from './dto/create-channel-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  GetChannelResponseDto,
  GetChannelResponseWrapperDto,
} from './dto/get-channel-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Channel } from '../decorators/channel-decorator';
import { type ChannelRequestData } from '../types/channel.types';
import { ChannelPreloadInterceptor } from '../interceptors/channel-preload.interceptor';
import { GetChannelDetailsResponseDto } from './dto/get-channel-details-response.dto';
import { PaginatedChannelQueryDto } from './dto/paginated-channel-videos-query.dto';
import {
  ChannelVideoResponseDto,
  PaginatedChannelVideosResponseDto,
} from './dto/get-channel-videos-response.dto';
import { OptionalAuthGuard } from '../user/guards/OptionalAuthGuard';
import {
  GetChannelPlaylistResponseDto,
  PaginatedChannelPlaylistsResponseDto,
} from './dto/get-channel-playlists-response.dto';
import { ChannelHomeResponseDto } from './dto/channel-home-response.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller()
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('owner/channels')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: ChannelCreatedResponseDto,
    description: 'Channel created successfully',
    summary: 'create channel',
  })
  async create(@User() user: JwtUserPayload) {
    const data = await this.channelService.create(user.userId, user.email);
    return new SuccessResponseShape<CreateChannelResponseDto>(data);
  }

  @Get('owner/channels')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: GetChannelResponseWrapperDto,
    description: 'get user channel',
    summary: "get user's channel",
  })
  async getChannel(@User() user: JwtUserPayload) {
    const data = await this.channelService.getChannel(user.userId);
    if (!data) throw new NotFoundException('channel was not found');
    return new SuccessResponseShape<GetChannelResponseDto>(data);
  }

  @Get('channels/:channelId')
  @UseGuards(OptionalAuthGuard)
  @ApiOkResponse({ type: GetChannelDetailsResponseDto })
  async getChannelDetails(
    @Param('channelId') channelId: string,
    @User() user: JwtUserPayload | undefined,
  ) {
    const channel = await this.channelService.getChannelDetails(
      channelId,
      user?.userId,
    );

    return new GetChannelDetailsResponseDto({
      channelId: channel.id,
      title: channel.title,
      description: channel.description,
      thumbnailUrl: channel.thumbnailUrl,
      channelImageUrl: channel.channelImageUrl,
      videosCount: channel._count.videos,
      subscriptionsCount: channel._count.subscriptions,
      totalViews: channel.totalViews,
      isSubscribed: channel.isSubscribed,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
      isOwner: channel.userId === user?.userId,
    });
  }

  @Get('channels/:channelId/videos')
  @UseGuards(OptionalAuthGuard)
  async getChannelVideos(
    @Param('channelId') channelId: string,
    @Query() query: PaginatedChannelQueryDto,
    @User() user: JwtUserPayload | undefined,
  ) {
    const { videos, ...rest } = await this.channelService.getChannelVideos(
      channelId,
      user?.userId,
      query,
    );

    const videoList = videos.map(
      (video) =>
        new ChannelVideoResponseDto({
          videoId: video.id,
          videoTitle: video.title,
          videoDescription: video.description,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          views: video.views,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          isInWatchLater: video.watchLaters
            ? video.watchLaters.length > 0
            : false,
          isLikedByUser: video.likes ? video.likes.length > 0 : false,
        }),
    );

    return new PaginatedChannelVideosResponseDto({
      items: videoList,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
      ...rest,
    });
  }

  @Get('channels/:channelId/playlists')
  async getChannelPlaylists(
    @Param('channelId') channelId: string,
    @Query() query: PaginatedChannelQueryDto,
  ) {
    const { playlists, ...rest } =
      await this.channelService.getChannelPlaylists(channelId, query);
    const playlistList = playlists.map(
      (playlist) =>
        new GetChannelPlaylistResponseDto({
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          isPublic: playlist.isPublic,
          videosCount: playlist._count.videos,
        }),
    );
    return new PaginatedChannelPlaylistsResponseDto({
      items: playlistList,
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
      ...rest,
    });
  }

  @Get('channels/:channelId/home')
  @UseGuards(OptionalAuthGuard)
  async getChannelHome(
    @Param('channelId') channelId: string,
    @User() user: JwtUserPayload | undefined,
  ) {
    const channel = await this.channelService.getChannelHome(
      channelId,
      user?.userId,
    );
    const videoList = channel.videos.map(
      (video) =>
        new ChannelVideoResponseDto({
          videoId: video.id,
          videoTitle: video.title,
          videoDescription: video.description,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          views: video.views,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          isInWatchLater: video.watchLaters
            ? video.watchLaters.length > 0
            : false,
          isLikedByUser: video.likes ? video.likes.length > 0 : false,
        }),
    );

    const playlistList = channel.playlists.map(
      (playlist) =>
        new GetChannelPlaylistResponseDto({
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          isPublic: playlist.isPublic,
          videosCount: playlist._count.videos,
        }),
    );

    return new ChannelHomeResponseDto({
      videos: videoList,
      playlists: playlistList,
    });
  }

  @Patch('owner/channels/upload-thumbnail')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'), ChannelPreloadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { thumbnail: { type: 'string', format: 'binary' } },
      required: ['thumbnail'],
    },
  })
  @ApiBearerAuth()
  async uploadThumbnail(
    @UploadedFile()
    thumbnail: Express.Multer.File,
    @Channel() channel: ChannelRequestData,
  ) {
    const data = await this.channelService.uploadThumbnailUrl(
      channel.id,
      thumbnail,
    );

    return new SuccessResponseShape({ thumbnailUrl: data.thumbnailUrl });
  }

  @Patch('owner/channels/upload-channel-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'), ChannelPreloadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
      required: ['avatar'],
    },
  })
  @ApiBearerAuth()
  async uploadAvatarUrl(
    @UploadedFile()
    avatar: Express.Multer.File,
    @Channel() channel: ChannelRequestData,
  ) {
    const data = await this.channelService.uploadChannelImageUrl(
      channel.id,
      avatar,
    );

    return new SuccessResponseShape({ channelImageUrl: data.channelImageUrl });
  }

  @Patch('owner/channels')
  @UseGuards(AuthGuard)
  async updateChannel(
    @User() user: JwtUserPayload,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelService.updateChannel(user.userId, updateChannelDto);
  }
}
