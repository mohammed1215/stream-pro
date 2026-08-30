import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    try {
      const newUser = await this.prisma.user.create({
        data: user,
        select: {
          id: true,
          email: true,
          avatarUrl: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return newUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        avatarUrl: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        deviceId: true,
        deviceToken: true,
        deviceType: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email, isDeleted: false },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId, isDeleted: false },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
