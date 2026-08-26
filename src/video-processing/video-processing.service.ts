import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { chmod } from 'fs/promises';
import { getVideoDurationInSeconds } from 'get-video-duration';

@Injectable()
export class VideoProcessingService {
  private execFilePromise = promisify(execFile);
  // This automatically resolves to the correct binary path (Windows locally, Linux on Render)
  private ffprobePath = ffprobeInstaller.path;

  constructor() {}

  async getVideoDuration(videoPath: string): Promise<number> {
    try {
      await chmod(this.ffprobePath, 0o755).catch(() => {});

      // Use execFile and pass arguments as an array. This is much safer and handles spaces in file paths perfectly.
      const { stdout } = await this.execFilePromise(this.ffprobePath, [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        // '-show_streams', // Add this back if you need codec/resolution data later
        videoPath,
      ]);

      const metadata = JSON.parse(stdout);
      const rawDuration = metadata?.format?.duration;

      if (!rawDuration) {
        throw new Error('Duration not found in metadata');
      }

      const duration =
        typeof rawDuration === 'string' ? parseFloat(rawDuration) : rawDuration;

      if (isNaN(duration) || duration <= 0) {
        throw new Error('Invalid duration value');
      }

      return Math.floor(duration);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('FFprobe failed:', error.message);
        throw new Error(`Could not extract video duration: ${error.message}`);
      }

      const errorMessage =
        typeof error === 'string' ? error : 'An unknown error occurred';
      console.error('FFprobe failed:', errorMessage);
      throw new Error(`Could not extract video duration: ${errorMessage}`);
    }
  }

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
