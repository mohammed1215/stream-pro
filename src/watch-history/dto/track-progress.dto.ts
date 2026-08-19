import { IsInt, IsUUID, Min } from 'class-validator';

export class TrackProgressDto {
  @IsUUID()
  videoId!: string;

  @IsInt()
  @Min(0)
  watchedSeconds!: number;
}
