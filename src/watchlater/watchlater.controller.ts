import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WatchlaterService } from './watchlater.service';
import { CreateWatchlaterDto } from './dto/create-watchlater.dto';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { WatchLaterListDto } from './dto/responses/watch-later-item.dto';
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('watchlaters')
export class WatchlaterController {
  constructor(private readonly watchlaterService: WatchlaterService) {}

  @Post()
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
  @ApiOperation({ summary: "Get the current user's watch-later list" })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Last watch-later item id from the previous page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default 20)',
  })
  @ApiOkResponse({ type: WatchLaterListDto })
  async findAll(
    @User() user: JwtUserPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.watchlaterService.findAllByUserId(
      user.userId,
      cursor,
      limit ? parseInt(limit) : 20,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.watchlaterService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateWatchlaterDto: UpdateWatchlaterDto,
  // ) {
  //   return this.watchlaterService.update(+id, updateWatchlaterDto);
  // }

  @Delete(':watchLaterId')
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
