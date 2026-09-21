import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchSuggestionsDto } from './dto/requests/get-term-suggestions.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('term-suggestions')
  async getTermSuggestions(@Query() dto: SearchSuggestionsDto) {
    return this.searchService.getSuggestions(dto.query);
  }
}
