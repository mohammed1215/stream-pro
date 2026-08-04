import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { v2 } from 'cloudinary';
import { cloudinaryConfig } from './cloudinary.config';
import { createReadStream } from 'fs';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor() {}

  onModuleInit() {
    v2.config(cloudinaryConfig);
  }
  uploadImage(image: Express.Multer.File): Promise<string> {
    if (!image) {
      throw new BadRequestException('No image file provided');
    }

    return new Promise((resolve, reject) => {
      const stream = v2.uploader.upload_stream(
        { resource_type: 'image' },
        (err, result) => {
          if (err) {
            console.error(err);
            reject(
              new InternalServerErrorException(
                'error while uploading the image',
              ),
            );
          }

          if (!result) {
            reject(
              new BadRequestException(
                'No Result Returned While Uploading Image',
              ),
            );
          }

          if (result) resolve(result.secure_url);
        },
      );
      const imagePath = image.path;
      const readStream = createReadStream(imagePath);
      readStream.pipe(stream);
    });
  }

  uploadVideo(video: Express.Multer.File): Promise<string> {
    if (!video) {
      throw new BadRequestException('No video file provided');
    }

    return new Promise((resolve, reject) => {
      const stream = v2.uploader.upload_stream(
        { resource_type: 'video' },
        (err, result) => {
          if (err) {
            console.error(err);
            reject(
              new InternalServerErrorException(
                'error while uploading the video',
              ),
            );
          }

          if (!result) {
            reject(
              new BadRequestException(
                'No Result Returned While Uploading video',
              ),
            );
          }

          if (result) resolve(result.secure_url);
        },
      );
      const videoPath = video.path;
      const readStream = createReadStream(videoPath);
      readStream.pipe(stream);
    });
  }
}
