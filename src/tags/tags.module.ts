import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsRepository } from './repositories/tags.repository';

@Module({
  providers: [TagsService, TagsRepository],
  exports: [TagsService, TagsRepository],
})
export class TagsModule {}
