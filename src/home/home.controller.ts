import { Controller, Get, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { OptionalAuthGuard } from '../user/guards/OptionalAuthGuard';
import { User } from '../decorators/user-decorator';
import { JwtUserPayload } from '../user/user.service';
import {
  FEED_SECTION_TYPE,
  FeedSection,
  HomeFeedResponseDto,
} from './dto/feed-response.dto';

@Controller('feed')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getFeed(@User() user: JwtUserPayload | undefined) {
    const feed = await this.homeService.getFeed(user?.userId ?? null);

    const sections: FeedSection[] = [];
    if (user?.userId && feed.subscriptions.length > 0) {
      sections.push(
        new FeedSection({
          type: FEED_SECTION_TYPE.SUBSCRIPTIONS,
          key: 'subscriptions',
          title: 'Subscriptions',
          videos: feed.subscriptions,
        }),
      );
    }
    if (feed.trending.length > 0) {
      sections.push(
        new FeedSection({
          type: FEED_SECTION_TYPE.TRENDING,
          key: 'trending',
          title: 'Trending',
          videos: feed.trending,
        }),
      );
    }
    if (feed.latest.length > 0) {
      sections.push(
        new FeedSection({
          type: FEED_SECTION_TYPE.LATEST,
          key: 'latest',
          title: 'Latest',
          videos: feed.latest,
        }),
      );
    }

    return new HomeFeedResponseDto(sections);
  }
}
