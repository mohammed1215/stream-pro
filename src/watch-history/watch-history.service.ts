import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { WatchHistoryRespository } from './repositories/watch-history.respository';
import { VideoRepository } from '../videos/repositories/video.repository';
import { isAfter, startOfToday, startOfYesterday, subDays } from 'date-fns';

export interface WatchHistoryItem {
  id: string;
  channel: {
    id: string;
    title: string;
    channelImageUrl: string | null;
  };
  video: {
    id: string;
    title: string;
    durationSeconds: number;
    thumbnailUrl: string;
  };
  watchedSeconds: number;
  videoDuration: number;
  completionRate: number;
  lastWatchedAt: Date;
}

@Injectable()
export class WatchHistoryService {
  constructor(
    private readonly watchHistoryRepository: WatchHistoryRespository,
    private readonly videoRepo: VideoRepository,
  ) {}

  create(createWatchHistoryDto: CreateWatchHistoryDto) {
    return 'This action adds a new watchHistory';
  }

  async trackProgress(userId: string, videoId: string, watchedSeconds: number) {
    const video = await this.videoRepo.findById(videoId);
    if (!video) throw new NotFoundException('Video not found');

    const clampedSeconds = Math.min(watchedSeconds, video.duration);
    return this.watchHistoryRepository.upsertProgress({
      userId,
      videoId,
      channelId: video.channelId,
      watchedSeconds: clampedSeconds,
      videoDuration: video.duration,
    });
  }

  async findAllByUserId(userId: string, cursor?: string, limit = 20) {
    const items = await this.watchHistoryRepository.findAllByUserId(
      userId,
      cursor,
      limit,
    );

    const newItems = items.map(({ video, ...rest }) => ({
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.duration,
      },
      ...rest,
    }));

    return this.groupByDate(newItems);
  }

  private groupByDate(items: WatchHistoryItem[]) {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    const groups = new Map<string, WatchHistoryItem[]>();

    for (const item of items) {
      const watchedDate = new Date(item.lastWatchedAt);
      let label: string;

      if (isAfter(watchedDate, today)) label = 'Today';
      else if (isAfter(watchedDate, yesterday)) label = 'Yesterday';
      else if (isAfter(watchedDate, last7Days)) label = 'Last 7 Days';
      else if (isAfter(watchedDate, last30Days)) label = 'Last 30 Days';
      else label = 'Older';

      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(item);
    }

    const order = [
      'Today',
      'Yesterday',
      'Last 7 Days',
      'Last 30 Days',
      'Older',
    ];

    return order
      .filter((label) => groups.has(label))
      .map((label) => ({ label, items: groups.get(label)! }));
  }

  findOne(id: number) {
    return `This action returns a #${id} watchHistory`;
  }
}
