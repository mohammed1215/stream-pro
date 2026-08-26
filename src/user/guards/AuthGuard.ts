import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUserPayload } from '../user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
    console.log('AuthGuard initialized');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const bearerToken = request.headers['authorization'];
    try {
      const payload = await this.checkAuthentication(bearerToken);
      request['user'] = payload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          'either token is expired or token is invalid, try logging in again',
        );
      }
      throw error;
    }
    return true;
  }

  async checkAuthentication(bearerToken: string | undefined) {
    //validate token
    if (!bearerToken) {
      throw new NotFoundException('token not found');
    }

    const [schema, token] = bearerToken.split(' ');
    if (schema !== 'Bearer') {
      throw new BadRequestException('Token Not Found');
    }
    const payload = await this.jwtService.verifyAsync<JwtUserPayload>(token);
    return payload;
  }
}
