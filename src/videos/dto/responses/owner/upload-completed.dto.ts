import { VideoStatus } from '../../../../generated/prisma/enums';

export class UploadCompletedResponseDto {
  id!: string;
  description!: string;
  duration!: number;
  title!: string;
  thumbnailUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  isDeleted!: boolean;
  videoUrl!: string | null;
  hlsUrl!: string | null;
  size!: number;
  isPublished!: boolean;
  views!: number;
  videoStatus!: VideoStatus;
  channelId!: string;
}
