import { ApiProperty } from '@nestjs/swagger';

export class UploadThumbnailDto {
  @ApiProperty({ type: 'file', name: 'thumbnail' })
  thumbnail!: Express.Multer.File;
}
