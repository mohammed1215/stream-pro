import { createParamDecorator } from '@nestjs/common';
import { ChannelAuthRequest } from 'src/types/channel.types';

export const Channel = createParamDecorator(
  (data, ctx) => ctx.switchToHttp().getRequest<ChannelAuthRequest>().channel,
);
