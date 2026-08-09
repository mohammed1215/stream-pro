import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from 'src/user/guards/AuthGuard';
import { User } from 'src/decorators/user-decorator';
import { JwtUserPayload } from 'src/user/user.service';
import {
  NotificationResponseDto,
  PaginatedNotificationResponseDto,
} from './dto/notification-response.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @Post()
  // create(@Body() createNotificationDto: CreateNotificationDto) {
  //   return this.notificationsService.create(createNotificationDto);
  // }

  // ========================== GET ==========================

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @User() loggedInUser: JwtUserPayload,
    @Query()
    query: NotificationQueryDto,
  ) {
    const notifications = await this.notificationsService.findAll(
      loggedInUser.userId,
      query.pageNumber ?? 1,
      query.pageSize ?? 10,
    );

    const notificationList = notifications.map(
      (notification) =>
        new NotificationResponseDto(
          notification.id,
          notification.actorId,
          notification.recipientId,
          notification.contextId,
          notification.message,
          notification.type,
          notification.isRead,
          notification.createdAt,
        ),
    );

    return new PaginatedNotificationResponseDto(
      notificationList,
      query.pageSize ?? 10,
      query.pageNumber ?? 1,
    );
  }

  // @Get(':id')
  // @UseGuards(AuthGuard)
  // findOne(@Param('id') id: string) {
  //   return this.notificationsService.findOne(+id);
  // }

  // ========================== PATCH ==========================

  @Patch()
  @UseGuards(AuthGuard)
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'All notifications marked as read',
        },
      },
    },
  })
  async markAllAsRead(@User() loggedInUser: JwtUserPayload) {
    await this.notificationsService.markAllAsRead(loggedInUser.userId);
    return { message: 'All notifications marked as read' };
  }

  @Patch(':notificationId')
  @UseGuards(AuthGuard)
  async markAsRead(
    @User() loggedInUser: JwtUserPayload,
    @Param('notificationId') notificationId: string,
  ) {
    const notification = await this.notificationsService.markAsRead(
      loggedInUser.userId,
      notificationId,
    );
    return new NotificationResponseDto(
      notification.id,
      notification.actorId,
      notification.recipientId,
      notification.contextId,
      notification.message,
      notification.type,
      notification.isRead,
      notification.createdAt,
    );
  }

  // @Patch(':id')
  // @UseGuards(AuthGuard)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNotificationDto: UpdateNotificationDto,
  // ) {
  //   return this.notificationsService.update(+id, updateNotificationDto);
  // }

  // // ========================== DELETE ==========================
  @Delete(':notificationId')
  @UseGuards(AuthGuard)
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Notification has been deleted successfully',
        },
      },
    },
  })
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @User() loggedInUser: JwtUserPayload,
  ) {
    await this.notificationsService.deleteNotification(
      notificationId,
      loggedInUser.userId,
    );
    return { message: 'Notification has been deleted successfully' };
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'All notifications have been deleted successfully',
        },
      },
    },
  })
  async deleteAllNotifications(@User() loggedInUser: JwtUserPayload) {
    await this.notificationsService.deleteAllNotificationsForUser(
      loggedInUser.userId,
    );
    return { message: 'All notifications have been deleted successfully' };
  }
}
