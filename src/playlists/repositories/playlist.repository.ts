import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Playlist, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlaylistRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPlaylist(
    title: string,
    userId: string,
    isPublic: boolean = false,
    description?: string,
  ): Promise<Playlist> {
    try {
      const playlist = await this.prismaService.playlist.create({
        data: { title, userId, description, isPublic },
      });
      return playlist;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Playlist with this title already exists for the user.',
          );
        }
      }
      throw error;
    }
  }

  async findAllPlaylistsForUser(userId: string) {
    const playlists = await this.prismaService.playlist.findMany({
      where: { userId },
    });
    return playlists;
  }

  async findVideosOfPlaylist(
    userId: string,
    playlistId: string,
    pageNumber = 1,
    pageSize = 10,
  ) {
    const videos = await this.prismaService.playlistVideo.findMany({
      where: { playlistId, playlist: { userId } },
      orderBy: { index: 'asc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: { video: true },
    });

    const count = await this.prismaService.playlistVideo.count({
      where: { playlistId, playlist: { userId } },
    });

    return { videos, count };
  }

  async findPlaylistsWithVideoBlongsToItOrNot(videoId: string, userId: string) {
    return this.prismaService.playlist.findMany({
      where: { userId },
      include: { videos: { where: { videoId }, take: 1 } },
    });
  }

  async addVideoToPlaylist(
    userId: string,
    playlistId: string,
    videoId: string,
  ) {
    await this.verifyOwnership(playlistId, userId);

    try {
      return await this.prismaService.playlistVideo.create({
        data: { playlistId, videoId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'Playlist or Video not found, or the playlist does not belong to the user.',
          );
        } else if (error.code === 'P2002') {
          throw new ConflictException('Video already exists in the playlist.');
        }
      }
      throw error;
    }
  }

  async updatePlaylist(
    userId: string,
    playlistId: string,
    updatePlaylist: Prisma.PlaylistUpdateInput,
  ) {
    try {
      return await this.prismaService.playlist.update({
        where: { id: playlistId, userId },
        data: updatePlaylist,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Playlist not found');
        }
      }
      throw error;
    }
  }

  async reorderVideosInPlaylist(
    userId: string,
    playlistId: string,
    videoIds: string[],
  ) {
    const playlist = await this.verifyOwnership(playlistId, userId);

    const existingIds = new Set(playlist.videos.map((v) => v.videoId));
    const newIds = new Set(videoIds);

    if (
      existingIds.size !== newIds.size ||
      ![...existingIds].every((id) => newIds.has(id))
    ) {
      throw new BadRequestException(
        'videoIds must match the playlist videos exactly',
      );
    }

    return this.prismaService.$transaction([
      this.prismaService.playlistVideo.deleteMany({
        where: { playlistId, playlist: { userId } },
      }),

      this.prismaService.playlistVideo.createMany({
        data: videoIds.map((videoId, index) => ({
          playlistId,
          videoId,
          index,
        })),
      }),
    ]);
  }

  async removePlaylist(userId: string, playlistId: string) {
    try {
      return await this.prismaService.playlist.delete({
        where: { id: playlistId, userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete playlist with associated videos',
          );
        } else if (error.code === 'P2025') {
          throw new NotFoundException('Playlist not found');
        }
      }
      throw error;
    }
  }

  async removeVideoFromPlaylist(
    userId: string,
    playlistId: string,
    videoId: string,
  ) {
    try {
      const result = await this.prismaService.playlistVideo.deleteMany({
        where: { playlistId, videoId, playlist: { userId } },
      });
      if (result.count === 0) {
        throw new NotFoundException(
          'Video not found in the playlist or the playlist does not belong to the user.',
        );
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw error;
    }
  }

  private async verifyOwnership(playlistId: string, userId: string) {
    const playlist = await this.prismaService.playlist.findFirst({
      where: { id: playlistId, userId },
      select: { id: true, userId: true, videos: { select: { videoId: true } } },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }
}
