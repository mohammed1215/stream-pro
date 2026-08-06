import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
