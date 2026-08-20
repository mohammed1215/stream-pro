import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRepository } from './repositories/video.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { VideoProcessingService } from 'src/video-processing/video-processing.service';
import fs from 'fs';
import { UpdateVideoDto } from './dto/update-video.dto';

import { VIDEO_DETAILS_OWNER_SELECT } from './repositories/video-select';
import { Prisma } from 'src/generated/prisma/client';
import { SortByVideo } from './dto/video-query.dto';
import { buildPaginationMeta } from 'src/utils/pagination.util';

@Injectable()
export class VideosService {
  constructor(
    private readonly videoRepo: VideoRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly videoProcessingService: VideoProcessingService,
  ) {}
  async create(
    channelId: string,
    createVideoDto: CreateVideoDto,
    videoFile?: Express.Multer.File,
    thumbnailFile?: Express.Multer.File,
  ) {
    if (!videoFile || !thumbnailFile) {
      throw new BadRequestException('video and thumbnail files are required');
    }
    try {
      // Find duration of video
      const duration = await this.videoProcessingService.getVideoDuration(
        videoFile.path,
      );

      // upload video to cloudinary
      const secureVideoUrl =
        await this.cloudinaryService.uploadVideo(videoFile);
      const secureThumbnailUrl =
        await this.cloudinaryService.uploadImage(thumbnailFile);

      return this.videoRepo.create(
        createVideoDto,
        duration ?? 0,
        videoFile.size,
        secureThumbnailUrl,
        secureVideoUrl,
        channelId,
      );
    } finally {
      this.removeFile(videoFile.path);
      this.removeFile(thumbnailFile.path);
    }
  }

  getAllVideosOfChannel(
    channelId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: SortByVideo,
  ) {
    return this.videoRepo.findAllVideosOfChannel(
      channelId,
      pageNumber,
      pageSize,
      sortBy,
    );
  }

  async getOwnerVideos(
    channelId: string,
    pageNumber: number,
    pageSize: number,
  ) {
    const { videos, totalCount } =
      await this.videoRepo.findAllVideosOfOwnerChannel(
        channelId,
        pageNumber,
        pageSize,
      );

    const meta = buildPaginationMeta(totalCount, pageNumber, pageSize);

    return { videos, ...meta };
  }

  async findOneVideoDetails(videoId: string, userId?: string) {
    const videoData = await this.videoRepo.findOneVideoDetails(videoId, userId);
    if (!videoData) throw new NotFoundException();
    return videoData;
  }

  async searchVideos(query: string, pageNumber: number, pageSize: number) {
    const data = await this.videoRepo.searchVideos(query, pageNumber, pageSize);
    return { ...data, pageNumber, pageSize };
  }

  // ================================= Updates ==============================

  async updateViews(videoId: string) {
    return this.videoRepo.updateViews(videoId);
  }

  // ================================ Publish Video ==============================

  async publishAndUnPublishVideo(videoId: string, channelId: string) {
    const data = await this.videoRepo.publishAndUnPublishVideo(
      videoId,
      channelId,
    );
    if (data === 0) {
      throw new NotFoundException('video not found or not owned by channel');
    }
    return {
      message: 'video publish status updated successfully',
      videoId,
      channelId,
      isPublished: data === 1,
    };
  }

  // ================================ Remove Video ==============================

  async removeVideo(videoId: string, channelId: string) {
    await this.videoRepo.removeVideo(videoId, channelId);
    return { message: 'video removed successfully', videoId, channelId };
  }

  removeFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log('Error while removing file: ', err.message);
      }
    });
  }

  // =============================== Update Video Details ==============================
  async updateVideoDetails(
    videoId: string,
    channelId: string,
    updateVideoDto: UpdateVideoDto,
  ) {
    const video = await this.videoRepo.updateVideoDetails(
      videoId,
      channelId,
      updateVideoDto,
    );

    if (!video) {
      throw new NotFoundException('video not found or not owned by channel');
    }

    return video;
  }

  async updateVideoThumbnail(
    videoId: string,
    channelId: string,
    thumbnailFile: Express.Multer.File,
  ) {
    if (!thumbnailFile) {
      throw new BadRequestException('thumbnail file is required');
    }
    let oldVideo: Prisma.VideoGetPayload<{
      select: typeof VIDEO_DETAILS_OWNER_SELECT;
    }> | null = null;
    let newVideo: Prisma.VideoGetPayload<{
      select: typeof VIDEO_DETAILS_OWNER_SELECT;
    }> | null = null;
    try {
      const imageUrl = await this.cloudinaryService.uploadImage(thumbnailFile);
      oldVideo = await this.videoRepo.findOneOwnerVideoDetails(videoId);
      newVideo = await this.videoRepo.updateVideoDetails(videoId, channelId, {
        thumbnailUrl: imageUrl,
      });
    } finally {
      this.removeFile(thumbnailFile.path);
      if (
        oldVideo &&
        oldVideo.thumbnailUrl &&
        newVideo &&
        newVideo.thumbnailUrl &&
        oldVideo.thumbnailUrl !== newVideo.thumbnailUrl
      ) {
        this.cloudinaryService.removeImage(oldVideo.thumbnailUrl);
      }
    }
  }

  async updateVideoMedia(
    videoId: string,
    channelId: string,
    video: Express.Multer.File,
  ) {
    if (!video) {
      throw new BadRequestException('video file is required');
    }

    let oldVideo: Prisma.VideoGetPayload<{
      select: typeof VIDEO_DETAILS_OWNER_SELECT;
    }> | null = null;
    let newVideo: Prisma.VideoGetPayload<{
      select: typeof VIDEO_DETAILS_OWNER_SELECT;
    }> | null = null;
    try {
      const videoUrl = await this.cloudinaryService.uploadVideo(video);
      oldVideo = await this.videoRepo.findOneOwnerVideoDetails(videoId);
      const duration = await this.videoProcessingService.getVideoDuration(
        video.path,
      );

      newVideo = await this.videoRepo.updateVideoDetails(videoId, channelId, {
        videoUrl,
        duration,
      });
    } finally {
      this.removeFile(video.path);
      if (
        oldVideo &&
        oldVideo.videoUrl &&
        newVideo &&
        newVideo.videoUrl &&
        oldVideo.videoUrl !== newVideo.videoUrl
      ) {
        this.cloudinaryService.removeVideo(oldVideo.videoUrl);
      }
    }
  }
}
