import { Request } from 'express';
import { JwtUserPayload } from '../user/user.service';

export type UserAuthRequest = Request & { user: JwtUserPayload };
