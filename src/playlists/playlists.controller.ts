import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseArrayPipe,
  Query,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PlaylistResponseDto } from './dto/playlist-response.dto';
import { QueryPlaylistDto } from './dto/query-playlist.dto';
import {
  PaginatedVideoOfPlaylistResponseDto,
  VideoOfPlaylistResponseDto,
} from './dto/videos-of-playlist-response.dto';
import { FindPlaylistWithVideoResponseDto } from './dto/find-playlist-with-video-response.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // ======================================= POST ==========================================

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'playlist has been created Successfully',
        },
        playlistId: { type: 'number', example: 1 },
        playlistTitle: { type: 'string', example: 'My Playlist' },
      },
    },
  })
  async create(
    @User() user: JwtUserPayload,
    @Body() createPlaylistDto: CreatePlaylistDto,
  ) {
    const playlist = await this.playlistsService.createPlaylist(
      user.userId,
      createPlaylistDto,
    );
    return {
      message: 'playlist has been created Successfully',
      playlistId: playlist.id,
      playlistTitle: playlist.title,
    };
  }

  @Post(':playlistId/videos/:videoId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async addVideoToPlaylist(
    @User() user: JwtUserPayload,
    @Param('playlistId') playlistId: string,
    @Param('videoId') videoId: string,
  ) {
    return await this.playlistsService.addVideoToPlaylist(
      user.userId,
      playlistId,
      videoId,
    );
  }

  // ======================================= GET ==========================================

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: [PlaylistResponseDto] })
  async findAllPlaylistsForUser(@User() user: JwtUserPayload) {
    const playlists = await this.playlistsService.findAllPlaylistsForUser(
      user.userId,
    );
    return playlists.map(
      (playlist) =>
        new PlaylistResponseDto(
          playlist.id,
          playlist.title,
          playlist.description,
          playlist.isPublic,
          playlist.createdAt,
          playlist.updatedAt,
        ),
    );
  }

  @Get('video/:videoId')
  @UseGuards(AuthGuard)
  @ApiResponse({ type: [FindPlaylistWithVideoResponseDto] })
  @ApiBearerAuth()
  async findPlaylistsWithVideoBlongsToItOrNot(
    @Param('videoId') videoId: string,
    @User() user: JwtUserPayload,
  ) {
    const playlists =
      await this.playlistsService.findPlaylistsWithVideoBlongsToItOrNot(
        videoId,
        user.userId,
      );
    return playlists.map(
      (playlist) =>
        new FindPlaylistWithVideoResponseDto(
          playlist.id,
          playlist.title,
          playlist.description,
          playlist.isPublic,
          playlist.createdAt,
          playlist.updatedAt,
          playlist.hasVideo,
        ),
    );
  }

  @Get(':playlistId/videos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: PaginatedVideoOfPlaylistResponseDto })
  async findVideosOfPlaylist(
    @User() user: JwtUserPayload,
    @Param('playlistId') playlistId: string,
    @Query() queryPlaylist: QueryPlaylistDto,
  ) {
    const {
      videos,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasNextPage,
    } = await this.playlistsService.findVideosOfPlaylist(
      user.userId,
      playlistId,
      queryPlaylist.pageNumber,
      queryPlaylist.pageSize,
    );

    const videoList = videos.map(
      (playlistVideo) =>
        new VideoOfPlaylistResponseDto(
          playlistVideo.video.id,
          playlistVideo.video.title,
          playlistVideo.video.description,
          playlistVideo.video.thumbnailUrl,
          playlistVideo.index,
          playlistVideo.playlistId,
          playlistVideo.createdAt,
        ),
    );

    return new PaginatedVideoOfPlaylistResponseDto(
      videoList,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasNextPage,
    );
  }

  // ======================================= PATCH ==========================================

  @Patch(':playlistId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('playlistId') playlistId: string,
    @User() user: JwtUserPayload,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    await this.playlistsService.updatePlaylist(
      user.userId,
      playlistId,
      updatePlaylistDto,
    );

    return { message: 'Playlist has been updated successfully' };
  }

  @Patch(':playlistId/videos/reorder')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { videoIds: { type: 'array', items: { type: 'string' } } },
    },
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async reorderVideosInPlaylist(
    @User() user: JwtUserPayload,
    @Param('playlistId') playlistId: string,
    @Body('videoIds', new ParseArrayPipe({ expectedType: String }))
    videoIds: string[],
  ) {
    await this.playlistsService.reorderVideosInPlaylist(
      user.userId,
      playlistId,
      videoIds,
    );

    return { message: 'videos has been reordered successfully', videoIds };
  }

  // ======================================= DELETE ==========================================

  @Delete(':playlistId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async removePlaylist(
    @Param('playlistId') playlistId: string,
    @User() user: JwtUserPayload,
  ) {
    await this.playlistsService.removePlaylist(user.userId, playlistId);
    return { message: 'Playlist has been removed successfully' };
  }

  @Delete(':playlistId/videos/:videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async removeVideoFromPlaylist(
    @User() user: JwtUserPayload,
    @Param('playlistId') playlistId: string,
    @Param('videoId') videoId: string,
  ) {
    await this.playlistsService.removeVideoFromPlaylist(
      user.userId,
      playlistId,
      videoId,
    );
    return { message: 'Video has been removed from the playlist successfully' };
  }
}
