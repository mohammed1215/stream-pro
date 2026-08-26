import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCommentDto: Prisma.CommentCreateInput) {
    try {
      const comment = await this.prismaService.comment.create({
        data: createCommentDto,
        include: {
          video: { include: { channel: { include: { user: true } } } },
        },
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
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ConflictException(
          'The specified user or video does not exist.',
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
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.max(1, pageSize);
    return this.prismaService.comment.findMany({
      where: filter,
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      include: { user: true },
    });
  }

  async findOne(commentId: string) {
    return await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });
  }

  async update(
    commentId: string,
    userId: string,
    updateCommentDto: Prisma.CommentUpdateInput,
  ) {
    try {
      const comment = await this.prismaService.comment.update({
        where: { id: commentId, userId },
        data: { ...updateCommentDto, isEditted: true },
      });
      return comment;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ConflictException(
          'Comment not found or user is not authorized to update this comment.',
        );
      }
      throw error;
    }
  }

  async remove(commentId: string, userId: string) {
    try {
      const comment = await this.prismaService.comment.delete({
        where: { id: commentId, userId },
      });
      return comment;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ConflictException(
          'Comment not found or user is not authorized to delete this comment.',
        );
      }
      throw error;
    }
  }
}
