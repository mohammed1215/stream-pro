import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCommentDto: Prisma.CommentCreateInput) {
    try {
      const comment = await this.prismaService.comment.create({
        data: createCommentDto,
      });
      return comment;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A comment with the same userId and videoId already exists.',
        );
      }
      throw error;
    }
  }

  async findAll(
    filter?: Prisma.CommentWhereInput,
    pageNumber: number = 1,
    pageSize: number = 10,
  ) {
    return this.prismaService.comment.findMany({
      where: filter,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(commentId: string) {
    return await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });
  }

  async update(commentId: string, updateCommentDto: Prisma.CommentUpdateInput) {
    const comment = await this.prismaService.comment.update({
      where: { id: commentId },
      data: { ...updateCommentDto, isEditted: true },
    });
    return comment;
  }

  async remove(commentId: string) {
    const comment = await this.prismaService.comment.delete({
      where: { id: commentId },
    });
    return comment;
  }
}
