import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import { AuthGuard } from '../user/guards/AuthGuard';
import { DownloadsService } from './downloads.service';
import { Response } from 'express';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get(':videoId')
  @UseGuards(AuthGuard)
  async downloadVideo(
    @Param('videoId') videoId: string,
    @User() user: JwtUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { title, contentLength, stream } =
      await this.downloadsService.downloadVideo(videoId, user.userId);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'none');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="video.mp4"; filename*=UTF-8''${encodeURIComponent(title)}.mp4`,
    );
    return new StreamableFile(stream, {
      type: 'video/mp4',
      length: contentLength ? Number(contentLength) : undefined,
    });
  }
}
