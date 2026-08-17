import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WatchlaterService } from './watchlater.service';
import { CreateWatchlaterDto } from './dto/create-watchlater.dto';
import { UpdateWatchlaterDto } from './dto/update-watchlater.dto';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('watchlaters')
export class WatchlaterController {
  constructor(private readonly watchlaterService: WatchlaterService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'video has been added to watch later',
        },
        watchLaterId: { type: 'string' },
        videoId: { type: 'string' },
      },
    },
  })
  async addToWatchLater(
    @User() user: JwtUserPayload,
    @Body() createWatchlaterDto: CreateWatchlaterDto,
  ) {
    const watchLaterData = await this.watchlaterService.addToWatchLater(
      user.userId,
      createWatchlaterDto,
    );
    return {
      message: 'video has been added to watch later',
      watchLaterId: watchLaterData.id,
      videoId: createWatchlaterDto.videoId,
    };
  }

  @Get()
  findAll() {
    return this.watchlaterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchlaterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWatchlaterDto: UpdateWatchlaterDto,
  ) {
    return this.watchlaterService.update(+id, updateWatchlaterDto);
  }

  @Delete(':watchLaterId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  removeFromWatchLater(
    @User() user: JwtUserPayload,
    @Param('watchLaterId') watchLaterId: string,
  ) {
    return this.watchlaterService.removeFromWatchLater(
      user.userId,
      watchLaterId,
    );
  }
}
