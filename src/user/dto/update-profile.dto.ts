import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'New Name', maxLength: 50 })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;
}
