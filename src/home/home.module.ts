import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeRepository } from './repositories/home.repository';

@Module({
  controllers: [HomeController],
  providers: [HomeService, HomeRepository],
})
export class HomeModule {}
