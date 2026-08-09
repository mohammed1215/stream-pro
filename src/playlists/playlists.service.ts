import { Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PlaylistRepository } from './repositories/playlist.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/generated/prisma/browser';

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

  findVideosOfPlaylist(userId: string, playlistId: string) {
    return this.playlistRepository.findVideosOfPlaylist(userId, playlistId);
  }

  findPlaylistsWithVideoBlongsToItOrNot(videoId: string, userId: string) {
    return this.playlistRepository.findPlaylistsWithVideoBlongsToItOrNot(
      videoId,
      userId,
    );
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
