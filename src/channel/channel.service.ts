import { Injectable, NotFoundException } from '@nestjs/common';
import { ChannelRepository } from './repositories/channel.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginatedChannelQueryDto } from './dto/paginated-channel-videos-query.dto';
import { buildPaginationMeta } from '../utils/pagination.util';
import { UpdateChannelDto } from './dto/update-channel.dto';

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

  async getChannelDetails(channelId: string, userId: string | undefined) {
    const channel = await this.channelRepo.findOneByIdWithCounts(
      channelId,
      userId,
    );
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async getChannelVideos(
    channelId: string,
    userId: string | undefined,
    query: PaginatedChannelQueryDto,
  ) {
    const { pageNumber = 1, pageSize = 10 } = query;

    const [channelExists, { videos, totalCount }] = await Promise.all([
      this.channelRepo.exists(channelId),
      this.channelRepo.findChannelVideosPaginated(
        channelId,
        userId,
        pageNumber,
        pageSize,
      ),
    ]);

    if (!channelExists) throw new NotFoundException('Channel not found');

    const meta = buildPaginationMeta(totalCount, pageNumber, pageSize);

    return { videos, ...meta };
  }

  async getChannelPlaylists(
    channelId: string,
    query: PaginatedChannelQueryDto,
  ) {
    const { pageNumber = 1, pageSize = 10 } = query;
    const playlists = await this.channelRepo.findChannelPlaylists(
      channelId,
      pageNumber,
      pageSize,
    );
    const meta = buildPaginationMeta(
      playlists.totalCount,
      pageNumber,
      pageSize,
    );
    return { ...playlists, ...meta };
  }

  async getChannelHome(channelId: string, userId?: string) {
    const channel = await this.channelRepo.findHomeChannel(channelId, userId);
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

  async updateChannel(userId: string, updateChannelDto: UpdateChannelDto) {
    const data = await this.channelRepo.updateChannelDetails(
      userId,
      updateChannelDto,
    );
    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        channelImageUrl: data.channelImageUrl,
        updatedAt: data.updatedAt,
      },
    };
  }
}
