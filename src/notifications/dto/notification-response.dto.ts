import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from 'src/generated/prisma/enums';

export class NotificationResponseDto {
  @ApiProperty()
  notificationId: string;
  @ApiProperty()
  actorId: string;
  @ApiProperty()
  recipientId: string;
  @ApiProperty({ nullable: true })
  contextId: string | null;
  @ApiProperty()
  message: string;
  @ApiProperty()
  type: NotificationType;
  @ApiProperty()
  isRead: boolean;
  @ApiProperty()
  createdAt: Date;

  constructor(
    notificationId: string,
    actorId: string,
    recipientId: string,
    contextId: string | null,
    message: string,
    type: NotificationType,
    isRead: boolean,
    createdAt: Date,
  ) {
    this.notificationId = notificationId;
    this.actorId = actorId;
    this.recipientId = recipientId;
    this.contextId = contextId;
    this.message = message;
    this.type = type;
    this.isRead = isRead;
    this.createdAt = createdAt;
  }
}

export class PaginatedNotificationResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  items: NotificationResponseDto[];
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  pageNumber: number;

  constructor(
    items: NotificationResponseDto[],
    pageSize: number,
    pageNumber: number,
  ) {
    this.items = items;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
