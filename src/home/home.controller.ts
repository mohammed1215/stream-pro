import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { OptionalAuthGuard } from '../user/guards/OptionalAuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('feed')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiQuery({
    name: 'excludeIds',
    required: false,
    type: String,
    description: 'Comma-separated list of video IDs to exclude from the feed',
  })
  async getFeed(
    @User() user: JwtUserPayload,
    @Query('excludeIds') excludeIds?: string,
  ) {
    let ids: string[] = [];

    if (Array.isArray(excludeIds)) {
      ids = excludeIds;
    } else if (typeof excludeIds === 'string' && excludeIds.trim().length > 0) {
      ids = excludeIds.includes(',') ? excludeIds.split(',') : [excludeIds];
    }
    const feed = await this.homeService.getFeed(user.userId, ids);
    return feed;
  }
}
