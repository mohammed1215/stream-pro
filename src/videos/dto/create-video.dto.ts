import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVideoDto {
  @IsString()
  description!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishTime?: Date;
}
