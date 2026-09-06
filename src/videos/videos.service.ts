import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRepository } from './repositories/video.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import fs from 'fs';
import { UpdateVideoDto } from './dto/update-video.dto';

import { videoDetailsOwnerSelectFor } from './repositories/video-select';
import { Prisma, VideoStatus } from '../generated/prisma/client';
import { SortByVideo } from './dto/video-query.dto';
import { buildPaginationMeta } from '../utils/pagination.util';
import { VideoSortByEnum, VideoStatusEnum } from './enum/enums';
import { UploadCompletedDto } from './dto/upload-completed.dto';

// Single source of truth for the "owner details, enriched with this
// user's like/subscription state" return type, derived directly from
// the select factory so it can never drift out of sync with it.
type VideoDetailsOwner = Prisma.VideoGetPayload<{
  select: ReturnType<typeof videoDetailsOwnerSelectFor>;
}>;

@Injectable()
export class VideosService {
  constructor(
    private readonly videoRepo: VideoRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  async create(channelId: string, createVideoDto: CreateVideoDto) {
    const video = await this.videoRepo.create(createVideoDto, channelId);
    const signatureVideoData = this.cloudinaryService.getVideoUploadSignature(
      video.id,
      `channels/${channelId}/videos`,
    );

    const signatureThumbnailData =
      this.cloudinaryService.getThumbnailUploadSignature(
        `${video.id}_thumb`,
        `channels/${channelId}/thumbnails`,
      );

    return {
      videoId: video.id,
      signatureVideoData,
      signatureThumbnailData,
    };
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
    status: VideoStatusEnum = VideoStatusEnum.ALL,
    sortBy: VideoSortByEnum = VideoSortByEnum.NEWEST,
  ) {
    const videos = await this.videoRepo.findAllVideosOfOwnerChannel(
      channelId,
      pageNumber,
      pageSize,
      status,
      sortBy,
    );

    const totalCount = await this.videoRepo.countVideosOfChannel(true);

    const meta = buildPaginationMeta(totalCount, pageNumber, pageSize);

    return { videos, ...meta };
  }

  async findOneVideoOwnerDetails(videoId: string, userId: string) {
    const videoData = await this.videoRepo.findOneOwnerVideoDetails(
      videoId,
      userId,
    );
    if (!videoData)
      throw new NotFoundException('video not found or not owned by channel');
    return {
      id: videoData.id,
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      hlsUrl: videoData.hlsUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      channelId: videoData.channel.id,
      channelTitle: videoData.channel.title,
      channelImageUrl: videoData.channel.channelImageUrl,
      durationSeconds: videoData.duration,
      views: videoData.views,
      commentsCount: videoData._count.comments,
      likesCount: videoData._count.likes,
      channelSubscribersCount: videoData.channel._count.subscriptions,
      isSubscribed: videoData.channel.isSubscribed,
      isLiked: videoData.isLikedByUser,
      createdAt: videoData.createdAt,
      isPublished: videoData.isPublished,
    };
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

  // removeFile(filePath: string) {
  //   fs.unlink(filePath, (err) => {
  //     if (err) {
  //       console.log('Error while removing file: ', err.message);
  //     }
  //   });
  // }

  // =============================== Update Video Details ==============================

  async updateVideoDetails(
    videoId: string,
    channelId: string,
    updateVideoDto: UpdateVideoDto,
    userId: string,
  ): Promise<VideoDetailsOwner> {
    const video = await this.videoRepo.updateVideoDetails(
      videoId,
      channelId,
      updateVideoDto,
      videoDetailsOwnerSelectFor(userId),
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
    userId: string,
  ): Promise<VideoDetailsOwner> {
    if (!thumbnailFile) {
      throw new BadRequestException('thumbnail file is required');
    }

    // Verify ownership BEFORE touching Cloudinary
    const oldVideo = await this.videoRepo.findOneOwnerVideoDetails(
      videoId,
      userId,
    );
    if (!oldVideo) {
      throw new NotFoundException('video not found or not owned by channel');
    }

    const imageUrl = await this.cloudinaryService.uploadImage(thumbnailFile);

    let newVideo: VideoDetailsOwner | null;
    try {
      newVideo = await this.videoRepo.updateVideoDetails(
        videoId,
        channelId,
        { thumbnailUrl: imageUrl },
        videoDetailsOwnerSelectFor(userId),
      );
    } catch (err) {
      // Roll back the orphaned upload if the DB write fails
      await this.cloudinaryService.removeImage(imageUrl);
      throw err;
    }

    if (!newVideo) {
      // Row disappeared between the ownership check and the update
      // (e.g. deleted concurrently) - clean up and report not found.
      await this.cloudinaryService.removeImage(imageUrl);
      throw new NotFoundException('video not found or not owned by channel');
    }

    if (
      oldVideo.thumbnailUrl &&
      oldVideo.thumbnailUrl !== newVideo.thumbnailUrl
    ) {
      this.cloudinaryService.removeImage(oldVideo.thumbnailUrl);
    }

    return newVideo;
  }

  async updateVideoMedia(
    videoId: string,
    channelId: string,
    video: Express.Multer.File,
    userId: string,
  ): Promise<VideoDetailsOwner> {
    if (!video) {
      throw new BadRequestException('thumbnail file is required');
    }

    // Verify ownership BEFORE touching Cloudinary
    const oldVideo = await this.videoRepo.findOneOwnerVideoDetails(
      videoId,
      userId,
    );
    if (!oldVideo) {
      throw new NotFoundException('video not found or not owned by channel');
    }

    const videoUrl = await this.cloudinaryService.uploadVideo(video);

    let newVideo: VideoDetailsOwner | null;
    try {
      newVideo = await this.videoRepo.updateVideoDetails(
        videoId,
        channelId,
        { videoUrl },
        videoDetailsOwnerSelectFor(userId),
      );
    } catch (err) {
      // Roll back the orphaned upload if the DB write fails
      await this.cloudinaryService.removeVideo(videoUrl);
      throw err;
    }

    if (!newVideo) {
      // Row disappeared between the ownership check and the update
      // (e.g. deleted concurrently) - clean up and report not found.
      await this.cloudinaryService.removeVideo(videoUrl);
      throw new NotFoundException('video not found or not owned by channel');
    }

    if (
      oldVideo.thumbnailUrl &&
      oldVideo.thumbnailUrl !== newVideo.thumbnailUrl
    ) {
      this.cloudinaryService.removeVideo(oldVideo.thumbnailUrl);
    }

    return newVideo;
  }

  getUploadSignature(channelId: string, videoId: string, folder: string) {
    const data = this.cloudinaryService.getVideoUploadSignature(
      videoId,
      folder,
    );
    return {
      ...data,
    };
  }

  verifyNotificationSignature(
    rawBody: any,
    timestamp: number,
    signature: string,
  ) {
    return this.cloudinaryService.verifyNotificationSignature(
      rawBody,
      timestamp,
      signature,
    );
  }

  async handleUploadNotification(payload: any) {
    if (payload.notification_type !== 'eager') return;

    const videoId = payload.public_id?.split('/').at(-1);
    if (!videoId) return;

    const hlsResult = payload.eager?.[0];
    const isStillProcessing = hlsResult?.status === 'processing';
    const hasFailed = hlsResult?.status === 'failed' || hlsResult?.error;
    let status: VideoStatus;

    if (isStillProcessing) status = VideoStatus.PROCESSING;
    else if (hasFailed || !hlsResult?.secure_url) status = VideoStatus.FAILED;
    else status = VideoStatus.READY;

    try {
      return await this.videoRepo.handleUploadNotification({
        publicId: videoId,
        status,
        hlsUrl: status === VideoStatus.READY ? hlsResult?.secure_url : null,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        console.warn(`Webhook: video ${videoId} not found`);
        return;
      }
      throw err;
    }
  }

  async uploadCompleted(
    channelId: string,
    uploadCompletedDto: UploadCompletedDto,
  ) {
    // check if signature is valid
    const result = this.cloudinaryService.verifyUploadResponseSignature({
      signature: uploadCompletedDto.signature,
      public_id: uploadCompletedDto.publicId,
      version: uploadCompletedDto.version,
    });

    const { publicId, version, signature } = uploadCompletedDto;

    if (publicId && version && signature) {
      const result2 =
        this.cloudinaryService.verifyUploadThumbnailResponseSignature({
          public_id: publicId,
          version: version,
          signature: signature,
        });

      if (!result2) {
        throw new BadRequestException('invalid thumbnail signature');
      }
    }

    if (!result) {
      throw new BadRequestException('invalid signature');
    }

    // check if video exists and belongs to the channel
    const video = await this.videoRepo.findById(uploadCompletedDto.videoId);
    if (!video) {
      throw new NotFoundException('video not found');
    }

    if (video.channelId !== channelId) {
      throw new BadRequestException('video does not belong to the channel');
    }
    console.log(uploadCompletedDto.publicId.split('/').at(-1));
    console.log(video.id);
    if (video.id !== uploadCompletedDto.publicId.split('/').at(-1)) {
      throw new BadRequestException('video id does not match public id');
    }

    return this.videoRepo.uploadCompleted(uploadCompletedDto.videoId, {
      ...uploadCompletedDto,
      duration: Math.trunc(uploadCompletedDto.duration),
    });
  }
}
