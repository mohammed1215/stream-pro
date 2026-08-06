import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { PlaylistRepository } from './repositories/playlist.repository';

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService, PlaylistRepository],
})
export class PlaylistsModule {}
