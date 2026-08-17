import { Injectable } from '@nestjs/common';
import { HomeRepository } from './repositories/home.repository';

@Injectable()
export class HomeService {
  constructor(private readonly homeRepository: HomeRepository) {}
  async getFeed(userId: string | null) {
    const [trending, latest, subscriptions] = await Promise.all([
      this.homeRepository.findTrendingVideos(),
      this.homeRepository.findLatestVideos(),
      userId
        ? this.homeRepository.findSubscriptionFeed(userId)
        : Promise.resolve([]),
    ]);
    return { trending, latest, subscriptions };
  }
}
