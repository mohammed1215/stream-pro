import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WatchlaterService } from './watchlater.service';
import { CreateWatchlaterDto } from './dto/create-watchlater.dto';
import { UpdateWatchlaterDto } from './dto/update-watchlater.dto';

@Controller('watchlater')
export class WatchlaterController {
  constructor(private readonly watchlaterService: WatchlaterService) {}

  @Post()
  create(@Body() createWatchlaterDto: CreateWatchlaterDto) {
    return this.watchlaterService.create(createWatchlaterDto);
  }

  @Get()
  findAll() {
    return this.watchlaterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchlaterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWatchlaterDto: UpdateWatchlaterDto) {
    return this.watchlaterService.update(+id, updateWatchlaterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchlaterService.remove(+id);
  }
}
