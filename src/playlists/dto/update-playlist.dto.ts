import { PartialType } from '@nestjs/swagger';
import { CreatePlaylistDto } from './create-playlist.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
