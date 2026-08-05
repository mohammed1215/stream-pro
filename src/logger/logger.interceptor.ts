import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;

    const now = Date.now();
    this.logger.log(`${method} ${url} - ${now}ms`);
    this.logger.log(`Headers: ${JSON.stringify(headers['authorization'])}`);
    return next.handle();
  }
}
