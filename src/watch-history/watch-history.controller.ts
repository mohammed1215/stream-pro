import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { TrackProgressDto } from './dto/track-progress.dto';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GroupedWatchHistoryDto } from './dto/responses/watch-history-item.dto';

@ApiTags('Watch History')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post('track')
  track(
    @Body() trackProgressDto: TrackProgressDto,
    @User() user: JwtUserPayload,
  ) {
    return this.watchHistoryService.trackProgress(
      user.userId,
      trackProgressDto.videoId,
      trackProgressDto.watchedSeconds,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get watch history grouped by date (Today, Yesterday, etc.)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Last watch-history item id from previous page',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default 20)',
  })
  @ApiOkResponse({ type: [GroupedWatchHistoryDto] })
  findAll(
    @User() user: JwtUserPayload,
    @Query('cursor') cursor?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.watchHistoryService.findAllByUserId(user.userId, cursor, limit);
  }

  @Get(':id')
  @ApiOkResponse({ type: GroupedWatchHistoryDto })
  findOne(@Param('id') id: string) {
    return this.watchHistoryService.findOne(+id);
  }
}
