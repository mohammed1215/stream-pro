import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthProvider,
  DeviceType,
  RevokedReason,
} from '../../generated/prisma/enums';

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

  async findByReplacedHash(oldHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: { replacedByHash: oldHash },
    });
  }

  async findBySessionId(sessionId: string) {
    return this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId },
    });
  }

  async findByUserId2(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        deviceToken: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
        appVersion: true,
        userAgent: true,
        city: true,
        country: true,
        createdIp: true,
        deviceName: true,
        isRevoked: true,
        revokedAt: true,
        revokedReason: true,
        lastIp: true,
        replacedByHash: true,
        loginMethod: true,
        userId: true,
        updatedAt: true,
      },
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
    deviceName: string | null,
    userAgent: string | null,
    createdIp: string | null,
    lastIp: string | null,
    country: string | null,
    city: string | null,
    appVersion: string | null,
    loginMethod: AuthProvider | null,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    if (!deviceId) {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          deviceToken,
          deviceType,
          deviceName,
          userAgent,
          createdIp,
          lastIp,
          country,
          city,
          appVersion,
          loginMethod,
          expiresAt,
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
        deviceName,
        userAgent,
        createdIp,
        lastIp,
        country,
        city,
        appVersion,
        loginMethod,
        expiresAt,
      },
      update: {
        tokenHash,
        deviceToken,
        deviceType,
        deviceId,
        deviceName,
        userAgent,
        createdIp,
        lastIp,
        country,
        city,
        appVersion,
        loginMethod,
        expiresAt,
        isRevoked: false,
        revokedAt: null,
        revokedReason: null,
        replacedByHash: null,
      },
    });
  }

  async rotateToken(
    id: string,
    newTokenHash: string,
    newExpiresAt: Date,
    newLastIp: string | null,
    userAgent: string | null,
    replacedByHash: string | null,
  ): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
        lastIp: newLastIp,
        userAgent,
        lastUsedAt: new Date(),
        replacedByHash,
      },
    });
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: RevokedReason.LOGOUT,
      },
    });
  }

  async revokeAllForUser(userId: string, reason: RevokedReason): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  invalidateDeviceTokens(deviceTokens: string[]) {
    return this.prisma.refreshToken.updateMany({
      where: { deviceToken: { in: deviceTokens } },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: RevokedReason.EXPIRED,
      },
    });
  }
}
