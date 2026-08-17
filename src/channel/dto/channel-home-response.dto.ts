import { GetChannelPlaylistResponseDto } from './get-channel-playlists-response.dto';
import { ChannelVideoResponseDto } from './get-channel-videos-response.dto';

export class ChannelHomeResponseDto {
  videos: ChannelVideoResponseDto[];
  playlists: GetChannelPlaylistResponseDto[];
  constructor({ videos, playlists }: ChannelHomeResponseDto) {
    this.videos = videos;
    this.playlists = playlists;
  }
}
