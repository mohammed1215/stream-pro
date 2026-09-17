import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { PlaylistRepository } from './repositories/playlist.repository';
import { PlaylistsOwnerController } from './playlists-owner.controller';

@Module({
  controllers: [PlaylistsController, PlaylistsOwnerController],
  providers: [PlaylistsService, PlaylistRepository],
})
export class PlaylistsModule {}
