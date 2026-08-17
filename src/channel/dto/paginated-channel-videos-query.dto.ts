import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginatedChannelQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  pageNumber?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  pageSize?: number = 10;
}
