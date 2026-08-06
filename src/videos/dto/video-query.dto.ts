import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum SortByVideo {
  CREATED_ASC = 'CREATED:ASC',
  CREATED_DSC = 'CREATED:DSC',
  VIEWS_ASC = 'VIEWS_ASC',
  VIEWS_DSC = 'VIEWS_DSC',
  LIKES_ASC = 'LIKES_ASC',
  LIKES_DSC = 'LIKES_DSC',
}

export class VideoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageNumber?: number = 1;

  @IsOptional()
  @IsEnum(SortByVideo)
  sortBy: SortByVideo = SortByVideo.CREATED_ASC;
}
