import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, RefreshTokenRepository],
  exports: [UserService, UserRepository, RefreshTokenRepository],
})
export class UserModule {}
