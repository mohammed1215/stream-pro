import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTrendingSearchTerms(query: string) {
    const result = await this.prisma.$queryRaw<{
      term: string;
      count: bigint;
    }>`SELECT term, COUNT(*) as count
    FROM "SearchQuery"
    WHERE term ILIKE ${query + '%'}
    GROUP BY term
    ORDER BY count DESC
    LIMIT 5;`;
    return result;
  }

  async logSearch(term: string, userId?: string) {
    await this.prisma.searchQuery.create({ data: { term, userId } });
  }
}
