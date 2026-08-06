import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { ChannelRepository } from './repositories/channel.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, ChannelRepository],
  imports: [CloudinaryModule],
  exports: [ChannelService, ChannelRepository],
})
export class ChannelModule {}
