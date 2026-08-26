import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
