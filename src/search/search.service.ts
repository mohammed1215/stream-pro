import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { VideosService } from '../videos/videos.service';
import { SearchQueryRepository } from './repositories/search-query.repository';

@Injectable()
export class SearchService {
  constructor(
    @Inject(forwardRef(() => VideosService))
    private readonly videosService: VideosService,
    private readonly searchQueryRepository: SearchQueryRepository,
  ) {}
  async getSuggestions(query: string) {
    const [videos, trendingTerms] = await Promise.all([
      this.videosService.searchVideos(query, 1, 5),
      this.searchQueryRepository.getTrendingSearchTerms(query),
    ]);
    return { videos, trendingTerms };
  }

  async logSearch(term: string, userId?: string) {
    return this.searchQueryRepository.logSearch(term, userId);
  }
}
