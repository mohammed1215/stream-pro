import { BadRequestException, Injectable } from '@nestjs/common';
import { TagsRepository } from './repositories/tags.repository';

@Injectable()
export class TagsService {
  private readonly MAX_TAGS_PER_VIDEO = 10;

  constructor(private readonly tagsRepository: TagsRepository) {}

  resolveTagsForVideo(tagNames: string[]) {
    const normalizedTagNames = Array.from(
      new Set(tagNames.map((tagName) => tagName.trim().toLowerCase())),
    );

    if (normalizedTagNames.length > this.MAX_TAGS_PER_VIDEO) {
      throw new BadRequestException(
        `A video can have at most ${this.MAX_TAGS_PER_VIDEO} tags`,
      );
    }

    return this.tagsRepository.findOrCreateTags(Array.from(normalizedTagNames));
  }
}
