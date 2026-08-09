import { NotificationType } from 'src/generated/prisma/enums';

export class CreateNotificationDto {
  actorId!: string;
  recipientId!: string;
  contextId!: string | null;
  message!: string;
  type!: NotificationType;

  constructor(
    actorId: string,
    recipientId: string,
    contextId: string | null,
    message: string,
    type: NotificationType,
  ) {
    this.actorId = actorId;
    this.recipientId = recipientId;
    this.contextId = contextId;
    this.message = message;
    this.type = type;
  }
}
