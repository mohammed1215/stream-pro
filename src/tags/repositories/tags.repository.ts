import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findOrCreateTags(tagNames: string[]) {
    const tags = await Promise.all(
      tagNames.map((tagName) =>
        this.prisma.tag.upsert({
          where: { name: tagName },
          create: { name: tagName },
          update: {},
          select: { id: true, name: true },
        }),
      ),
    );
    return tags;
  }
}
