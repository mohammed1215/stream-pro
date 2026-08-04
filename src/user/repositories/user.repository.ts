import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: CreateUserDto) {
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
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
