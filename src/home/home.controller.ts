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
    const ids =
      excludeIds
        ?.split(',')
        .map((id) => id.trim())
        .filter(Boolean) ?? [];
    const feed = await this.homeService.getFeed(user.userId, ids);
    console.log(ids);
    return feed;
  }
}
