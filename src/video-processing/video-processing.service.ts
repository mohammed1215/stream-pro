import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type {
  parseFile as ParseFile,
  parseBuffer as ParseBuffer,
} from 'music-metadata';

@Injectable()
export class VideoProcessingService {
  async getVideoDurationUsingFilePath(videoPath: string): Promise<number> {
    try {
      const { parseFile } = (await import('music-metadata')) as {
        parseFile: typeof ParseFile;
      };
      const metadata = await parseFile(videoPath);
      const duration = metadata.format.duration;

      if (!duration) {
        throw new Error('Duration not found in file metadata');
      }

      return Math.floor(duration);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting video duration from file path:', message);
      throw new InternalServerErrorException(
        `Could not extract video duration from file path: ${message}`,
      );
    }
  }

  async getVideoDurationUsingStream(
    video: Express.Multer.File,
  ): Promise<number> {
    try {
      const { parseBuffer } = (await import('music-metadata')) as {
        parseBuffer: typeof ParseBuffer;
      };
      const metadata = await parseBuffer(video.buffer, video.mimetype);
      const duration = metadata.format.duration;
      console.log('GETTING DURATION: ', duration);
      if (!duration) {
        throw new Error('Duration not found in file metadata');
      }

      return Math.floor(duration);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting video duration from stream:', message);
      throw new InternalServerErrorException(
        `Could not extract video duration from stream: ${message}`,
      );
    }
  }
}
