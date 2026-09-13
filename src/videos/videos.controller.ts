import {
  Controller,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { Receiver } from '@upstash/qstash';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('videos-internal')
@Controller('videos/internal')
export class VideosInternalController {
  private receiverQStash = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  });

  constructor(private readonly videosService: VideosService) {}

  @Post('publish/:videoId')
  async publishVideo(
    @Param('videoId') videoId: string,
    @Headers('upstash-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new UnauthorizedException('Raw body is missing');
    }
    const isValid = await this.receiverQStash.verify({
      signature,
      body: req.rawBody.toString(),
    });
    if (!isValid) throw new UnauthorizedException();
    return this.videosService.publishVideo(videoId);
  }
}
