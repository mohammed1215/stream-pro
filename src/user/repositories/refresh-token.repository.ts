import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeviceType } from '../../generated/prisma/enums';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash: token },
      include: { user: true },
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

  async upsertToken(
    userId: string,
    tokenHash: string,
    deviceToken: string | null,
    deviceType: DeviceType | null,
    deviceId: string | null,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    if (!deviceId) {
      await this.prisma.refreshToken.create({
        data: { userId, tokenHash, deviceToken, deviceType, expiresAt },
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
        expiresAt,
      },
      update: {
        tokenHash,
        deviceToken,
        deviceType,
        expiresAt,
        isRevoked: false,
      },
    });
  }

  async rotateToken(
    id: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
        lastUsedAt: new Date(),
      },
    });
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
