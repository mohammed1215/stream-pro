import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class UploadCompletedDto {
  @ApiProperty({ description: 'Video UUID' })
  @IsUUID()
  @IsNotEmpty()
  videoId!: string;

  @ApiProperty({ description: 'Cloudinary Video Public ID' })
  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @ApiProperty({ description: 'Cloudinary Asset Version' })
  @IsNumber()
  @Type(() => Number)
  version!: number;

  @ApiProperty({ description: 'Cloudinary Signature for verification' })
  @IsString()
  @IsNotEmpty()
  signature!: string;

  @ApiProperty({ description: 'Video duration in seconds' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  duration!: number;

  @ApiProperty({ description: 'Video size in bytes' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  bytes!: number;

  // ================= Thumbnail Fields (Optional) =================

  @ApiPropertyOptional({ description: 'Cloudinary Thumbnail Public ID' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thumbnailPublicId?: string;

  @ApiPropertyOptional({ description: 'Cloudinary Thumbnail Version' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  thumbnailVersion?: number;

  @ApiPropertyOptional({ description: 'Cloudinary Thumbnail Signature' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thumbnailSignature?: string;

  @ApiPropertyOptional({ description: 'Cloudinary Thumbnail Secure URL' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;
}
