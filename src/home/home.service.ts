import { Injectable } from '@nestjs/common';
import { HomeRepository } from './repositories/home.repository';

@Injectable()
export class HomeService {
  constructor(private readonly homeRepository: HomeRepository) {}
  async getFeed(userId: string, excludeIds?: string[]) {
    const { categoryIds, channelIds, tagIds, watchedVideoIds } =
      await this.homeRepository.findUserTasteProfile(userId);

    const allExcludeIds = new Set<string>([
      ...(excludeIds || []),
      ...watchedVideoIds,
    ]);

    const coWatchers = await this.homeRepository.findCoWatchers(
      watchedVideoIds,
      userId,
    );

    const coWatchVideos = await this.homeRepository.findVideosByCoWatch(
      coWatchers,
      [...allExcludeIds],
    );

    const categoriesVideos =
      await this.homeRepository.findVideosBySpecificCategories(
        new Array(...categoryIds.keys()),
        [...allExcludeIds],
      );

    const tagsVideos = await this.homeRepository.findVideosBySpecificTags(
      new Array(...tagIds.keys()),
      [...allExcludeIds],
    );

    const channelsVideos =
      await this.homeRepository.findVideosBySpecificChannels(
        new Array(...channelIds.keys()),
        [...allExcludeIds],
      );

    const videoMap = new Map<string, (typeof categoriesVideos)[number]>();
    const scoreMap = new Map<string, number>();

    const addScore = (videoId: string, points: number) => {
      scoreMap.set(videoId, (scoreMap.get(videoId) ?? 0) + points);
    };

    for (const video of categoriesVideos) {
      videoMap.set(video.id, video);
      if (video.categoryId)
        addScore(video.id, 10 * (categoryIds.get(video.categoryId) ?? 1));
    }

    for (const video of tagsVideos) {
      videoMap.set(video.id, video);
      const tagWeight = video.tags.reduce(
        (sum, tag) => sum + (tagIds.get(tag.id) ?? 0),
        0,
      );
      addScore(video.id, 20 * tagWeight);
    }

    for (const video of channelsVideos) {
      videoMap.set(video.id, video);
      addScore(video.id, 30 * (channelIds.get(video.channelId) ?? 1));
    }

    for (const video of coWatchVideos) {
      videoMap.set(video.id, video);
      addScore(video.id, 40);
    }

    return [...videoMap.values()].sort(
      (a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0),
    );
  }
}
