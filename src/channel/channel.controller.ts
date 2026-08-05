import {
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthGuard } from '../user/guards/AuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import { SuccessResponseShape } from '../user/dto/ResponseShape.dto';
import {
  ChannelCreatedResponseDto,
  CreateChannelResponseDto,
} from './dto/create-channel-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  GetChannelResponseDto,
  GetChannelResponseWrapperDto,
} from './dto/get-channel-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Channel } from '../decorators/channel-decorator';
import { type ChannelRequestData } from 'src/types/channel.types';
import { ChannelPreloadInterceptor } from 'src/interceptors/channel-preload.interceptor';
import { UploadThumbnailDto } from './dto/upload-thumbnail.dto';

@Controller()
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('owner/channels')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({
    type: ChannelCreatedResponseDto,
    description: 'Channel created successfully',
    summary: 'create channel',
  })
  async create(@User() user: JwtUserPayload) {
    const data = await this.channelService.create(user.userId, user.email);
    return new SuccessResponseShape<CreateChannelResponseDto>(data);
  }

  @Get('owner/channels')
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({
    type: GetChannelResponseWrapperDto,
    description: 'get user channel',
    summary: "get user's channel",
  })
  async getChannel(@User() user: JwtUserPayload) {
    const data = await this.channelService.getChannel(user.userId);
    if (!data) throw new NotFoundException('channel was not found');
    return new SuccessResponseShape<GetChannelResponseDto>(data);
  }

  @Patch('owner/channels/upload-thumbnail')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'), ChannelPreloadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { thumbnail: { type: 'string', format: 'binary' } },
      required: ['thumbnail'],
    },
  })
  @ApiBearerAuth()
  async uploadThumbnail(
    @UploadedFile()
    thumbnail: Express.Multer.File,
    @Channel() channel: ChannelRequestData,
  ) {
    const data = await this.channelService.uploadThumbnailUrl(
      channel.id,
      thumbnail,
    );

    return new SuccessResponseShape({ thumbnailUrl: data.thumbnailUrl });
  }

  @Patch('owner/channels/upload-channel-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'), ChannelPreloadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
      required: ['avatar'],
    },
  })
  @ApiBearerAuth()
  async uploadAvatarUrl(
    @UploadedFile()
    avatar: Express.Multer.File,
    @Channel() channel: ChannelRequestData,
  ) {
    const data = await this.channelService.uploadChannelImageUrl(
      channel.id,
      avatar,
    );

    return new SuccessResponseShape({ channelImageUrl: data.channelImageUrl });
  }
}
