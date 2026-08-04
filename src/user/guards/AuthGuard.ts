import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUserPayload } from '../user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const bearerToken = request.headers['authorization'];
    const payload = await this.checkAuthentication(bearerToken);
    request['user'] = payload;
    return true;
  }

  async checkAuthentication(bearerToken: string | undefined) {
    //validate token
    if (!bearerToken) {
      throw new NotFoundException('token not found');
    }

    const [_, token] = bearerToken.split(' ');
    const payload = await this.jwtService.verifyAsync<JwtUserPayload>(token);
    return payload;
  }
}
