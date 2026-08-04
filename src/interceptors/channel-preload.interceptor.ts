import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ChannelService } from 'src/channel/channel.service';
import { UserAuthRequest } from 'src/types/auth-response.types';

@Injectable()
export class ChannelPreloadInterceptor implements NestInterceptor {
  constructor(private readonly channelService: ChannelService) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest<UserAuthRequest>();

    const user = request['user'];
    const channel = await this.channelService.getChannel(user.userId);

    if (!channel) throw new NotFoundException('channel was not found');

    request['channel'] = channel;

    return next.handle();
  }
}
