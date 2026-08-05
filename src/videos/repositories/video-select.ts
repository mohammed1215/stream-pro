import { Prisma } from 'generated/prisma/client';

export const VIDEO_DETAILS_SELECT = {
  id: true,
  description: true,
  title: true,
  views: true,
  duration: true,
  updatedAt: true,
  videoUrl: true,
  thumbnailUrl: true,
  channel: {
    select: {
      id: true,
      title: true,
      channelImageUrl: true,
      description: true,
      thumbnailUrl: true,
    },
  },
} satisfies Prisma.VideoSelect;

export const VIDEO_LIST_SELECT = {
  id: true,
  title: true,
  updatedAt: true,
  views: true,
  duration: true,
  videoUrl: true,
  thumbnailUrl: true,
  channel: { select: { id: true, title: true, channelImageUrl: true } },
  _count: true,
} satisfies Prisma.VideoSelect;

export const VIDEO_LIST_OWNER_SELECT = {
  id: true,
  title: true,
  updatedAt: true,
  views: true,
  duration: true,
  videoUrl: true,
  thumbnailUrl: true,
  isPublished: true,
  channel: { select: { id: true, title: true, channelImageUrl: true } },
  _count: true,
} satisfies Prisma.VideoSelect;
