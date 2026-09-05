import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { v2 } from 'cloudinary';
import { cloudinaryConfig } from './cloudinary.config';
import { Readable } from 'stream';

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

      Readable.from(image.buffer).pipe(stream);
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
      Readable.from(video.buffer).pipe(stream);
    });
  }
  removeImage(imageUrl: string): Promise<any> {
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (!publicId) {
      return Promise.reject(new BadRequestException('Invalid image URL'));
    }

    return new Promise((resolve, reject) => {
      v2.uploader.destroy(
        publicId,
        { resource_type: 'image' },
        (err, result) => {
          if (err) {
            console.error(err);
            return reject(
              new InternalServerErrorException(
                'error while removing the image',
              ),
            );
          }
          resolve(result);
        },
      );
    });
  }

  removeVideo(videoUrl: string): Promise<any> {
    const publicId = videoUrl.split('/').pop()?.split('.')[0];
    if (!publicId) {
      return Promise.reject(new BadRequestException('Invalid video URL'));
    }

    return new Promise((resolve, reject) => {
      v2.uploader.destroy(
        publicId,
        { resource_type: 'video' },
        (err, result) => {
          if (err) {
            console.error(err);
            return reject(
              new InternalServerErrorException(
                'error while removing the video',
              ),
            );
          }
          resolve(result);
        },
      );
    });
  }

  getUploadSignature(publicId: string, folder: string) {
    const timestamp = Math.floor(Date.now() / 1000);

    const eager = [{ streaming_profile: 'full_hd', format: 'm3u8' }];
    const eagerString = (v2.utils as any).build_eager(eager);
    const eagerNotificationUrl = cloudinaryConfig.eagerNotificationUrl;

    const paramsToSign = {
      timestamp,
      folder,
      eager: eagerString,
      eager_async: true,
      eager_notification_url: eagerNotificationUrl,
      public_id: publicId,
    };

    const signature = v2.utils.api_sign_request(
      paramsToSign,
      cloudinaryConfig.api_secret ?? '',
    );

    return {
      signature,
      timestamp,
      apiKey: cloudinaryConfig.api_key,
      folder,
      eager: eagerString,
      eagerNotificationUrl,
      eagerAsync: true,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name ?? ''}/video/upload`,
    };
  }

  verifyNotificationSignature(
    rawBody: any,
    timestamp: number,
    signature: string,
  ) {
    const secret = cloudinaryConfig.api_secret ?? '';
    console.log('secret length:', secret.length);
    console.log('received signature:', signature);
    const result = v2.utils.verifyNotificationSignature(
      rawBody!.toString(),
      timestamp,
      signature,
      7200,
    );
    console.log('verification result:', result);
    return result;
  }

  verifyUploadResponseSignature(payload: {
    signature: string;
    public_id: string;
    version: number;
  }) {
    const expectedSignature = v2.utils.api_sign_request(
      { public_id: payload.public_id, version: payload.version },
      cloudinaryConfig.api_secret ?? '',
    );

    return expectedSignature === payload.signature;
  }
}
