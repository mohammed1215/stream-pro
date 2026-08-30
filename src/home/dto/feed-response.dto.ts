export class VideoFeedItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  views: number;
  createdAt: Date;
  channel: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };

  constructor({
    id,
    title,
    thumbnailUrl,
    durationSeconds,
    views,
    createdAt,
    channel,
  }: {
    id: string;
    title: string;
    thumbnailUrl: string;
    durationSeconds: number;
    views: number;
    createdAt: Date;
    channel: {
      id: string;
      title: string;
      thumbnailUrl: string | null;
    };
  }) {
    this.id = id;
    this.title = title;
    this.thumbnailUrl = thumbnailUrl;
    this.durationSeconds = durationSeconds;
    this.views = views;
    this.createdAt = createdAt;
    this.channel = channel;
  }
}

export enum FEED_SECTION_TYPE {
  TRENDING = 'TRENDING',
  LATEST = 'LATEST',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
}

export class FeedSection {
  key: string;
  title: string;
  type: FEED_SECTION_TYPE;
  videos: VideoFeedItem[];

  constructor({
    key,
    title,
    type,
    videos,
  }: {
    key: string;
    title: string;
    type: FEED_SECTION_TYPE;
    videos: VideoFeedItem[];
  }) {
    this.key = key;
    this.title = title;
    this.type = type;
    this.videos = videos;
  }
}

export class HomeFeedResponseDto {
  sections: FeedSection[];

  constructor(sections: FeedSection[]) {
    this.sections = sections;
  }
}
