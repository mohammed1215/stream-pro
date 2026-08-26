import { Request } from 'express';
import { Channel } from '../generated/prisma/client';

export type ChannelAuthRequest = Request & {
  channel: Pick<
    Channel,
    | 'id'
    | 'title'
    | 'description'
    | 'thumbnailUrl'
    | 'channelImageUrl'
    | 'createdAt'
    | 'updatedAt'
  >;
};

export type ChannelRequestData = Pick<
  Channel,
  | 'id'
  | 'title'
  | 'description'
  | 'thumbnailUrl'
  | 'channelImageUrl'
  | 'createdAt'
  | 'updatedAt'
>;
