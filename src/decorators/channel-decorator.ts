import { createParamDecorator } from '@nestjs/common';
import { ChannelAuthRequest } from '../types/channel.types';

export const Channel = createParamDecorator(
  (data, ctx) => ctx.switchToHttp().getRequest<ChannelAuthRequest>().channel,
);
