import { Injectable } from '@nestjs/common';
// import * as ffprobe from 'fluent-ffprobe';
import { exec } from 'child_process';
import { promisify } from 'util';
@Injectable()
export class VideoProcessingService {
  execPromise = promisify(exec);
  constructor() {
    // Ensure ffprobe path is set if it's not in your system PATH
    // ffprobe.FFPROBE_PATH = require('@ffprobe-installer/ffprobe').path;
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    try {
      // fluent-ffprobe has a built-in 'duration' command that returns a float directly
      // const duration = await ffprobe.get(videoPath, 'duration');
      const { stdout } = await this.execPromise(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`,
      );
      let duration: string | number = JSON.parse(stdout).format.duration;
      if (typeof duration === 'string') {
        duration = Number(duration);
      }

      return Math.floor(duration);

      // If you strictly need an integer, use Math.floor() or Math.ceil() instead of Math.round()
    } catch (error: unknown) {
      // 1. Handle standard Error objects
      if (error instanceof Error) {
        console.error('FFprobe failed:', error.message);
        throw new Error(`Could not extract video duration: ${error.message}`);
      }

      // 2. Handle string errors or other primitives thrown by the library
      const errorMessage =
        typeof error === 'string' ? error : 'An unknown error occurred';
      console.error('FFprobe failed:', errorMessage);
      throw new Error(`Could not extract video duration: ${errorMessage}`);
    }
  }
}
