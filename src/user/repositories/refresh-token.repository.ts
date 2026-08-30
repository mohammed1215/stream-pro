import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeviceType } from '../../generated/prisma/enums';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveToken(
    userId: string,
    refreshToken: string,
    deviceToken: string | null,
    deviceType: DeviceType | null,
    deviceId: string | null,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshToken,
        deviceToken,
        deviceType,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deviceId,
      },
    });
  }

  async findByUserIdAndDeviceId(userId: string, deviceId: string) {
    return this.prisma.refreshToken.findFirst({
      where: { userId, deviceId },
    });
  }

  async findByToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash: token },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId },
    });
  }

  async findActiveDeviceTokensByUserId(userId: string): Promise<string[]> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
        deviceToken: { not: null },
      },
      select: { deviceToken: true },
      distinct: ['deviceToken'],
    });

    return tokens
      .map((t) => t.deviceToken)
      .filter((t): t is string => t !== null);
  }

  async updateToken(
    refreshToken: string,
    deviceToken: string | null,
    deviceType: DeviceType | null,
    deviceId: string | null,
    tokenHash: string,
  ) {
    await this.prisma.refreshToken.update({
      where: { tokenHash: refreshToken },
      data: {
        deviceToken,
        deviceType,
        deviceId,
        tokenHash,
      },
    });
  }

  async upsertToken(
    userId: string,
    tokenHash: string,
    deviceToken: string | null,
    deviceType: DeviceType | null,
    deviceId: string | null,
  ): Promise<void> {
    if (!deviceId) {
      // If no deviceId is provided, always create a new row (like a separate web session)
      await this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          deviceToken,
          deviceType,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return;
    }
    await this.prisma.refreshToken.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: {
        userId,
        tokenHash,
        deviceToken,
        deviceType,
        deviceId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        tokenHash,
        deviceToken,
        deviceType,
        deviceId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
