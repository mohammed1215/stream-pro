import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  searchByName(query: string) {
    return this.prisma.category.findMany({
      where: {
        isDeleted: false,
        name: { contains: query, mode: 'insensitive' },
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
