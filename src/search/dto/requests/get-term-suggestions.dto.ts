import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchSuggestionsDto {
  @ApiProperty({ example: 'react hooks' })
  @IsString()
  @IsNotEmpty({ message: 'query is required' })
  @MinLength(2, { message: 'query must be at least 2 characters' })
  query!: string;
}
