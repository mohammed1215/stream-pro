import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ThumbnailUploadCompletedDto {
  @IsString() publicId!: string;
  @IsNumber() version!: number;
  @IsString() signature!: string;
  @IsString() @IsNotEmpty() thumbnailUrl!: string;
}
