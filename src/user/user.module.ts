import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { VideosModule } from '../videos/videos.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, RefreshTokenRepository],
  exports: [UserService, UserRepository, RefreshTokenRepository],
  imports: [VideosModule],
})
export class UserModule {}
