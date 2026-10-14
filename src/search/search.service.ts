import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { VideosService } from '../videos/videos.service';
import { SearchQueryRepository } from './repositories/search-query.repository';

const ENCODED_PATTERN = /%(?:[0-9A-Fa-f]{2})/;

/**
 * Decodes terms that arrive (or were stored) percent-encoded and trims them,
 * so search history stays human-readable. Never throws: malformed input is
 * returned as-is.
 */
export function normalizeSearchTerm(term: string): string {
  let current = (term ?? '').trim();
  for (let i = 0; i < 2 && ENCODED_PATTERN.test(current); i++) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next.trim();
    } catch {
      break;
    }
  }
  return current;
}

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
    const normalized = normalizeSearchTerm(term);
    if (!normalized) return;
    return this.searchQueryRepository.logSearch(normalized, userId);
  }
}
