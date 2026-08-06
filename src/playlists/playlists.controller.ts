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
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { PlaylistResponseDto } from './dto/playlist-response.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // ======================================= POST ==========================================

  @Post()
  @UseGuards(AuthGuard)
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
  findPlaylistsWithVideoBlongsToItOrNot(
    @Param('videoId') videoId: string,
    @User() user: JwtUserPayload,
  ) {
    return this.playlistsService.findPlaylistsWithVideoBlongsToItOrNot(
      videoId,
      user.userId,
    );
  }

  @Get(':playlistId/videos')
  @UseGuards(AuthGuard)
  findVideosOfPlaylist(
    @User() user: JwtUserPayload,
    @Param('playlistId') playlistId: string,
  ) {
    return this.playlistsService.findVideosOfPlaylist(user.userId, playlistId);
  }

  // ======================================= PATCH ==========================================

  @Patch(':playlistId')
  @UseGuards(AuthGuard)
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
  async removePlaylist(
    @Param('playlistId') playlistId: string,
    @User() user: JwtUserPayload,
  ) {
    await this.playlistsService.removePlaylist(user.userId, playlistId);
    return { message: 'Playlist has been removed successfully' };
  }

  @Delete(':playlistId/videos/:videoId')
  @UseGuards(AuthGuard)
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
