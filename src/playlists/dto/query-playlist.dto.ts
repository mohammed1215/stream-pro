import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class QueryPlaylistDto {
  @ApiProperty({ required: false, default: 1 })
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsInt()
  pageNumber?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsInt()
  pageSize?: number = 10;
}
