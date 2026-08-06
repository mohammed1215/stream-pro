import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WatchlaterRepository {
  constructor(private readonly prismaService: PrismaService) {}

  //   async createWatchLater(createWatchLater: Prisma.WatchLaterCreateInput) {
  //     return this.prismaService.watchLater.create({ data: createWatchLater });
  //   }

  async addToWatchLater(
    createWatchLater: Prisma.WatchLaterUncheckedCreateInput,
  ) {
    try {
      return await this.prismaService.watchLater.create({
        data: createWatchLater,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This video is already in the watchlater list',
        );
      }
      throw error;
    }
  }

  async removeFromWatchLater(userId: string, watchLaterId: string) {
    try {
      return await this.prismaService.watchLater.delete({
        where: { id: watchLaterId, userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException(
              'This video is already in the watchlater list',
            );
          case 'P2003':
          case 'P2025':
            throw new NotFoundException('User or video not found');
        }
      }
      throw error;
    }
  }
}
