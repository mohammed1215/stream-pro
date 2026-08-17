import { Prisma } from 'src/generated/prisma/client';

export const VIDEO_DETAILS_SELECT_WITH_SUBSCRIPTIONS_OF_CHANNEL = {
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
      _count: true,
      subscriptions: {
        where: {},
      },
    },
  },
  _count: true,
} satisfies Prisma.VideoSelect;

export const VIDEO_DETAILS_SELECT = {
  id: true,
  description: true,
  title: true,
  views: true,
  duration: true,
  updatedAt: true,
  videoUrl: true,
  createdAt: true,
  thumbnailUrl: true,
  channel: {
    select: {
      id: true,
      title: true,
      channelImageUrl: true,
      description: true,
      thumbnailUrl: true,
      _count: true,
    },
  },
  _count: true,
};

export const VIDEO_DETAILS_OWNER_SELECT = {
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
      _count: true,
    },
  },
  _count: true,
} satisfies Prisma.VideoSelect;

export const VIDEO_LIST_SELECT = {
  id: true,
  title: true,
  updatedAt: true,
  views: true,
  duration: true,
  videoUrl: true,
  createdAt: true,
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
  description: true,
  createdAt: true,
  channel: { select: { id: true, title: true, channelImageUrl: true } },
  _count: true,
} satisfies Prisma.VideoSelect;
