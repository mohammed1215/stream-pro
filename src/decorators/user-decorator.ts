import { createParamDecorator } from '@nestjs/common';
import { UserAuthRequest } from '../types/auth-response.types';

export const User = createParamDecorator(
  (data, ctx) => ctx.switchToHttp().getRequest<UserAuthRequest>().user,
);
