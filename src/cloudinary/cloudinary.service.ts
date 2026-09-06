import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { v2 } from 'cloudinary';
import { cloudinaryConfig } from './cloudinary.config';
import { Readable } from 'stream';
import * as crypto from 'crypto';
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

  async removeResource(
    publicId: string,
    resourceType: 'image' | 'video',
  ): Promise<any> {
    if (!publicId) {
      throw new BadRequestException(`Invalid ${resourceType} identifier`);
    }

    try {
      const result = await v2.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });

      if (result.result === 'not found') {
        console.warn(`${resourceType} not found on Cloudinary: ${publicId}`);
      }

      return result;
    } catch (err) {
      console.error(`Failed to delete ${resourceType} (${publicId}):`, err);
      throw new InternalServerErrorException(`Error removing ${resourceType}`);
    }
  }

  async removeImage(publicId: string) {
    return this.removeResource(publicId, 'image');
  }

  async removeVideo(publicId: string) {
    return this.removeResource(publicId, 'video');
  }

  private signPayload(
    payload: Record<string, unknown>,
    resourceType: 'image' | 'video',
  ) {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { ...payload, timestamp };
    const signature = v2.utils.api_sign_request(
      paramsToSign,
      cloudinaryConfig.api_secret ?? '',
    );
    return {
      ...paramsToSign,
      signature,
      apiKey: cloudinaryConfig.api_key,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name ?? ''}/${resourceType}/upload`,
    };
  }

  getVideoUploadSignature(publicId: string, folder: string) {
    const timestamp = Math.floor(Date.now() / 1000);

    const eager = [{ streaming_profile: 'full_hd', format: 'm3u8' }];
    const eagerString = (v2.utils as any).build_eager(eager);
    const eagerNotificationUrl = cloudinaryConfig.eagerNotificationUrl;

    return this.signPayload(
      {
        timestamp,
        folder,
        eager: eagerString,
        eager_async: true,
        eager_notification_url: eagerNotificationUrl,
        public_id: publicId,
      },
      'video',
    );
  }

  getThumbnailUploadSignature(publicId: string, folder: string) {
    const timestamp = Math.floor(Date.now() / 1000);

    return this.signPayload(
      {
        timestamp,
        folder,
        public_id: publicId,
        transformation: 'c_fill,w_1280,h_720,q_auto,f_auto',
      },
      'image',
    );
  }

  verifyNotificationSignature(
    rawBody: any,
    timestamp: number,
    signature: string,
  ) {
    const secret = cloudinaryConfig.api_secret ?? '';
    const bodyString = rawBody!.toString();

    const stringToSign = bodyString + timestamp + secret;
    const expectedSignature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    console.log(bodyString);

    console.log('--- DEBUG ---');
    console.log('body length:', bodyString.length);
    console.log('body first 100 chars:', bodyString.substring(0, 100));
    console.log(
      'body last 50 chars:',
      bodyString.substring(bodyString.length - 50),
    );
    console.log('timestamp used:', timestamp);
    console.log('current server time:', Math.floor(Date.now() / 1000));
    console.log(
      'time diff (seconds):',
      Math.floor(Date.now() / 1000) - timestamp,
    );
    console.log('expected signature (manual):', expectedSignature);
    console.log('received signature:', signature);
    console.log('match:', expectedSignature === signature);

    const result = v2.utils.verifyNotificationSignature(
      bodyString,
      timestamp,
      signature,
      7200,
    );
    console.log('SDK verification result:', result);
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

  verifyUploadThumbnailResponseSignature(payload: {
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
