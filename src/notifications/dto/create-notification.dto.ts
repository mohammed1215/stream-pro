import { NotificationType } from '../../generated/prisma/enums';

export class CreateNotificationDto {
  actorId!: string;
  recipientId!: string;
  videoId?: string;
  commentId?: string;
  channelId?: string;
  playlistId?: string;
  message!: string;
  type!: NotificationType;

  constructor(
    actorId: string,
    recipientId: string,

    message: string,
    type: NotificationType,
    videoId?: string,
    commentId?: string,
    channelId?: string,
    playlistId?: string,
  ) {
    this.actorId = actorId;
    this.recipientId = recipientId;
    this.message = message;
    this.type = type;
    this.videoId = videoId;
    this.commentId = commentId;
    this.channelId = channelId;
    this.playlistId = playlistId;
  }
}
