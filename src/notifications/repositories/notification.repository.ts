import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { NotificationType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(
    actorId: string,
    recipientId: string,
    contextId: string | null,
    message: string,
    type: NotificationType,
  ) {
    return await this.prisma.notification.create({
      data: {
        actorId,
        recipientId,
        contextId,
        message,
        type,
      },
    });
  }

  async getNotificationsForUser(userId: string, pageNumber = 1, pageSize = 10) {
    return await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return await this.prisma.notification.update({
      where: { id: notificationId, recipientId: userId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: { recipientId: userId },
      data: { isRead: true },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    try {
      return await this.prisma.notification.delete({
        where: { id: notificationId, recipientId: userId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notification with id ${notificationId} not found for user ${userId}`,
        );
      }
      throw error;
    }
  }

  async deleteAllNotificationsForUser(userId: string) {
    return await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });
  }
}
