import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { chmod } from 'fs/promises';
import { getVideoDurationInSeconds } from 'get-video-duration';

@Injectable()
export class VideoProcessingService {
  private execFilePromise = promisify(execFile);

  constructor() {}

  async getVideoDurationUsingFilePath(videoPath: string) {
    try {
      const duration = await getVideoDurationInSeconds(videoPath);
      return Math.floor(duration);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error getting video duration from file path:',
          error.message,
        );
        throw new InternalServerErrorException(
          `Could not extract video duration from file path: ${error.message}`,
        );
      }
    }
  }

  async getVideoDurationUsingStream(video: Express.Multer.File) {
    try {
      const duration = await getVideoDurationInSeconds(video.stream);
      return Math.floor(duration);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error getting video duration from stream:',
          error.message,
        );
        throw new InternalServerErrorException(
          `Could not extract video duration from stream: ${error.message}`,
        );
      }
    }
  }
}
