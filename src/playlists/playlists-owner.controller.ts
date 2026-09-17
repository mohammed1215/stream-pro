import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { AuthGuard } from '../user/guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import { PlaylistOwnerResponseDto } from './dto/responses/owner/get-owner-playlists.dto';

@Controller('owner/playlists')
@UseGuards(AuthGuard)
export class PlaylistsOwnerController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  getOwnerPlaylists(
    @User() user: JwtUserPayload,
  ): Promise<PlaylistOwnerResponseDto[]> {
    return this.playlistsService.findAllPlaylistsForUserIncludingPrivate(
      user.userId,
    );
  }
}
