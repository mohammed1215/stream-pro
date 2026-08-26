import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationRepository } from './repositories/notification.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { FirebaseService } from '../firebase/firbase.service';
import { NotificationType } from '../generated/prisma/browser';

const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  [NotificationType.LIKE]: 'New Like',
  [NotificationType.COMMENT]: 'New Comment',
  [NotificationType.PLAYLIST]: 'Added to Playlist',
  [NotificationType.SUBSCRIPTION]: 'New Subscriber',
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly firebaseService: FirebaseService,
    private readonly userRepo: UserRepository,
  ) {}
  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationRepository.createNotification(
      createNotificationDto.actorId,
      createNotificationDto.recipientId,
      createNotificationDto.contextId,
      createNotificationDto.message,
      createNotificationDto.type,
    );

    const user = await this.userRepo.findById(notification.recipientId);

    if (!user)
      throw new NotFoundException(
        `User with id ${notification.recipientId} not found`,
      );

    if (user.deviceToken) {
      await this.firebaseService.sendPushNotification(
        user.deviceToken,
        NOTIFICATION_TITLES[notification.type],
        notification.message,
        {
          contextId: notification.contextId ?? '',
          notificationId: notification.id,
        },
      );
    }
    return notification;
  }

  findAll(recipientId: string, pageNumber = 1, pageSize = 10) {
    return this.notificationRepository.getNotificationsForUser(
      recipientId,
      pageNumber,
      pageSize,
    );
  }

  // findOne(id: number) {
  //   return this.notificationRepository.findNotificationById(id);
  // }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllNotificationsAsRead(userId);
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification =
      await this.notificationRepository.markNotificationAsRead(
        userId,
        notificationId,
      );
    return notification;
  }

  // update(id: number, updateNotificationDto: UpdateNotificationDto) {
  //   return this.notificationRepository.updateNotification(
  //     id,
  //     updateNotificationDto,
  //   );
  // }

  deleteNotification(notificationId: string, userId: string) {
    return this.notificationRepository.deleteNotification(
      userId,
      notificationId,
    );
  }

  deleteAllNotificationsForUser(userId: string) {
    return this.notificationRepository.deleteAllNotificationsForUser(userId);
  }
}
