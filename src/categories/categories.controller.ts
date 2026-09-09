import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { FindAllCategoriesResponseDto } from './dto/responses/find-all-response.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @Post()
  // create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categoriesService.create(createCategoryDto);
  // }

  @Get()
  findAll(): Promise<FindAllCategoriesResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @Get('search')
  searchByName(@Query('q') query: string) {
    return this.categoriesService.searchByName(query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return this.categoriesService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(+id);
  // }
}
