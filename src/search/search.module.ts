import { forwardRef, Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { VideosModule } from '../videos/videos.module';
import { SearchQueryRepository } from './repositories/search-query.repository';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchQueryRepository],
  exports: [SearchService, SearchQueryRepository],
  imports: [forwardRef(() => VideosModule)],
})
export class SearchModule {}
