import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateWatchlaterDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  videoId!: string;
}
