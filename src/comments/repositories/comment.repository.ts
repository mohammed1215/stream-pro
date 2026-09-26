import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    videoId: string,
  ) {
    try {
      const comment = await this.prismaService.comment.create({
        data: {
          ...createCommentDto,
          parentId: createCommentDto.parentId || null,
          userId,
          videoId,
        },
        include: {
          video: { include: { channel: { include: { user: true } } } },
        },
      });
      return comment;
    } catch (error) {
      if (
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
    sort: 'asc' | 'desc' = 'desc',
  ) {
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.max(1, pageSize);
    return this.prismaService.comment.findMany({
      where: filter,
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      include: { user: true },
      orderBy: { createdAt: sort },
    });
  }

  findAllRepliesOfComment(
    parentId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sort: 'asc' | 'desc' = 'desc',
  ) {
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.max(1, pageSize);
    return this.prismaService.comment.findMany({
      where: { parentId, isDeleted: false },
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      include: { user: true },
      orderBy: { createdAt: sort },
    });
  }

  async findOne(commentId: string) {
    return await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });
  }

  async findAllCommentsWithSpecificSelect(
    userId: string,
    pageNumber = 1,
    pageSize = 10,
  ) {
    return await this.prismaService.comment.findMany({
      where: { video: { channel: { userId } }, isDeleted: false },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      select: {
        id: true,
        content: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
        createdAt: true,
        updatedAt: true,
        video: { select: { id: true, title: true, thumbnailUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
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

  async countComments(filter?: Prisma.CommentWhereInput) {
    return this.prismaService.comment.count({ where: filter });
  }
}
