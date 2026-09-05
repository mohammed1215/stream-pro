import {
  BadRequestException,
  Controller,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideosService } from '../videos/videos.service';
@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly videosService: VideosService) {}

  @Post('cloudinary')
  async handleCloudinaryWebhook(@Req() req: RawBodyRequest<Request>) {
    const timestamp = req.headers['x-cld-timestamp'];
    const signature = req.headers['x-cld-signature'];
    if (!timestamp || !signature) {
      throw new BadRequestException('Missing required headers');
    }
    const isValid = this.videosService.verifyNotificationSignature(
      req.rawBody,
      Number(timestamp),
      signature as string,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const payload = JSON.parse(req.rawBody!.toString());
    await this.videosService.handleUploadNotification(payload);
    return;
  }
}
