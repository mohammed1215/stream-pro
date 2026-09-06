import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class VideoUploadCompletedDto {
  @IsString() publicId!: string;
  @IsNumber() version!: number;
  @IsString() signature!: string;
  @IsNumber() @Type(() => Number) duration!: number;
  @IsNumber() @Type(() => Number) bytes!: number;
}
