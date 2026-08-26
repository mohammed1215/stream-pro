import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PlaylistRepository } from './repositories/playlist.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../generated/prisma/browser';

@Injectable()
export class PlaylistsService {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly notificationsService: NotificationsService,
  ) {}
  async createPlaylist(userId: string, createPlaylistDto: CreatePlaylistDto) {
    const playlist = await this.playlistRepository.createPlaylist(
      createPlaylistDto.title,
      userId,
      createPlaylistDto.isPublic,
      createPlaylistDto.description,
    );

    if (playlist.isPublic === true) {
      await this.notificationsService.create({
        actorId: userId,
        recipientId: userId,
        contextId: playlist.id,
        message: `Your playlist ${playlist.title} is now public`,
        type: NotificationType.PLAYLIST,
      });
    }
    return playlist;
  }

  findAllPlaylistsForUser(userId: string) {
    return this.playlistRepository.findAllPlaylistsForUser(userId);
  }

  async findVideosOfPlaylist(
    userId: string,
    playlistId: string,
    pageNumber = 1,
    pageSize = 10,
  ) {
    const playlist = await this.playlistRepository.findByIdAndUserId(
      playlistId,
      userId,
    );

    if (!playlist)
      throw new NotFoundException(
        'Playlist not found or does not belong to the user',
      );

    const { videos, count } =
      await this.playlistRepository.findVideosOfPlaylist(
        userId,
        playlistId,
        pageNumber,
        pageSize,
      );

    const totalPages = Math.ceil(count / pageSize);
    const hasNextPage = pageNumber < totalPages;

    return {
      videos,
      totalCount: count,
      pageNumber,
      pageSize,
      totalPages,
      hasNextPage,
      isPublic: playlist.isPublic,
    };
  }

  async findPlaylistsWithVideoBlongsToItOrNot(videoId: string, userId: string) {
    const playlists =
      await this.playlistRepository.findPlaylistsWithVideoBlongsToItOrNot(
        videoId,
        userId,
      );
    return playlists.map((playlist) => ({
      ...playlist,
      hasVideo: playlist.videos.length > 0,
    }));
  }

  async findOnePlaylistDetails(
    playlistId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ) {
    const playlist = await this.playlistRepository.findOne(playlistId);

    if (!playlist || playlist.isDeleted) {
      throw new NotFoundException('Playlist not found');
    }

    if (!playlist.isPublic && playlist.userId !== userId) {
      throw new ForbiddenException('This playlist is private');
    }

    const videos = await this.playlistRepository.findVideosPaginated(
      playlistId,
      cursor,
      limit,
    );
    const videoCount =
      await this.playlistRepository.countVideosInPlaylist(playlistId);

    return {
      playlistId: playlist.id,
      title: playlist.title,
      description: playlist.description,
      isPublic: playlist.isPublic,
      videoCount,
      items: videos.map((v) => ({
        videoId: v.videoId,
        title: v.video.title,
        thumbnailUrl: v.video.thumbnailUrl,
        duration: v.video.duration,
        views: v.video.views,
        createdAt: v.video.createdAt,
        channelId: v.video.channel.id,
        channelTitle: v.video.channel.title,
        channelImageUrl: v.video.channel.channelImageUrl,
      })),
    };
  }

  addVideoToPlaylist(userId: string, playlistId: string, videoId: string) {
    return this.playlistRepository.addVideoToPlaylist(
      userId,
      playlistId,
      videoId,
    );
  }

  async updatePlaylist(
    userId: string,
    playlistId: string,
    updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return await this.playlistRepository.updatePlaylist(
      userId,
      playlistId,
      updatePlaylistDto,
    );
  }

  async reorderVideosInPlaylist(
    userId: string,
    playlistId: string,
    videoIds: string[],
  ) {
    return await this.playlistRepository.reorderVideosInPlaylist(
      userId,
      playlistId,
      videoIds,
    );
  }

  removePlaylist(userId: string, playlistId: string) {
    return this.playlistRepository.removePlaylist(userId, playlistId);
  }

  removeVideoFromPlaylist(userId: string, playlistId: string, videoId: string) {
    return this.playlistRepository.removeVideoFromPlaylist(
      userId,
      playlistId,
      videoId,
    );
  }
}
