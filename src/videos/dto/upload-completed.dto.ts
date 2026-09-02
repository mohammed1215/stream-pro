import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class UploadCompletedDto {
  @IsUUID()
  @IsNotEmpty()
  videoId!: string;

  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @IsNumber()
  @Type(() => Number)
  version!: number;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  duration!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  bytes!: number;
}
