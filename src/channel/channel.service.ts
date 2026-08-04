import { Injectable } from '@nestjs/common';
import { ChannelRepository } from './repositories/channel.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ChannelService {
  constructor(
    private channelRepo: ChannelRepository,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(userId: string, name: string) {
    const channel = await this.channelRepo.create(userId, { title: name });
    return channel;
  }

  async getChannel(userId: string) {
    const channel = await this.channelRepo.findOneByUserId(userId);
    return channel;
  }

  async uploadThumbnailUrl(channelId: string, thumbnail: Express.Multer.File) {
    const secureUrl = await this.cloudinaryService.uploadImage(thumbnail);
    const updatedChannel = await this.channelRepo.updateThumbnailUrl(
      channelId,
      secureUrl,
    );
    return updatedChannel;
  }

  async uploadChannelImageUrl(
    channelId: string,
    channelImage: Express.Multer.File,
  ) {
    const secureUrl = await this.cloudinaryService.uploadImage(channelImage);
    const updatedChannel = await this.channelRepo.updateChannelImageUrl(
      channelId,
      secureUrl,
    );
    return updatedChannel;
  }
}
