import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoRepository } from './repositories/video.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import { UpdateVideoDto } from './dto/update-video.dto';

import { videoDetailsOwnerSelectFor } from './repositories/video-select';
import { Prisma, VideoStatus } from '../generated/prisma/client';
import { SortByVideo } from './dto/video-query.dto';
import { buildPaginationMeta } from '../utils/pagination.util';
import { VideoSortByEnum, VideoStatusEnum } from './enum/enums';
import { VideoUploadCompletedDto } from './dto/video-upload-completed.dto';
import { ThumbnailUploadCompletedDto } from './dto/thumbnail-upload-completed.dto';

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

  // =========================== Upload Completed ===========================

  async videoUploadCompleted(
    channelId: string,
    videoId: string,
    dto: VideoUploadCompletedDto,
  ) {
    const isValid = this.cloudinaryService.verifyUploadResponseSignature({
      signature: dto.signature,
      public_id: dto.publicId,
      version: dto.version,
    });
    if (!isValid) {
      throw new BadRequestException('invalid signature');
    }

    const video = await this.findAndAuthorizeVideo(videoId, channelId);

    const segment = dto.publicId.split('/').at(-1);
    if (segment !== video.id) {
      throw new BadRequestException('video id does not match public id');
    }

    return this.videoRepo.updateVideoDetails(
      video.id,
      channelId,
      { publicId: dto.publicId, duration: dto.duration, size: dto.bytes },
      { id: true, publicId: true },
    );
  }

  async thumbnailUploadCompleted(
    channelId: string,
    videoId: string,
    dto: ThumbnailUploadCompletedDto,
  ) {
    const isValid = this.cloudinaryService.verifyUploadResponseSignature({
      signature: dto.signature,
      public_id: dto.publicId,
      version: dto.version,
    });
    if (!isValid) {
      throw new BadRequestException('invalid thumbnail signature');
    }

    const video = await this.findAndAuthorizeVideo(videoId, channelId);

    const segment = dto.publicId.split('/').at(-1);
    if (segment !== `${video.id}_thumb`) {
      throw new BadRequestException(
        'video id does not match thumbnail public id',
      );
    }

    return this.videoRepo.updateVideoDetails(
      video.id,
      channelId,
      {
        thumbnailUrl: dto.thumbnailUrl,
      },
      { id: true, thumbnailUrl: true },
    );
  }

  private getThumbnailPublicId(channelId: string, videoId: string): string {
    return `channels/${channelId}/thumbnails/${videoId}_thumb`;
  }

  private async findAndAuthorizeVideo(videoId: string, channelId: string) {
    const video = await this.videoRepo.findById(videoId);
    if (!video) {
      throw new NotFoundException('video not found');
    }
    if (video.channelId !== channelId) {
      throw new BadRequestException('video does not belong to the channel');
    }
    return video;
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

    const totalCount = await this.videoRepo.countVideosOfChannel(
      channelId,
      true,
    );

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
    const video = await this.videoRepo.findById(videoId);
    if (!video) throw new NotFoundException('video not found');

    if (video.publicId) {
      await this.cloudinaryService.removeVideo(video.publicId);
    } else {
      console.warn(`No publicId for video ${videoId}, skipping video cleanup`);
    }

    await this.cloudinaryService.removeImage(
      this.getThumbnailPublicId(channelId, videoId),
    );

    await this.videoRepo.removeVideo(videoId, channelId);
    return { message: 'video removed successfully', videoId, channelId };
  }

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

  // update video thumbnail signature (signed direct-to-Cloudinary flow)
  getUpdateVideoThumbnailSignature(videoId: string, channelId: string) {
    return this.cloudinaryService.getThumbnailUploadSignature(
      `${videoId}_thumb`,
      `channels/${channelId}/thumbnails`,
    );
  }

  getUpdateVideoMediaSignature(videoId: string, channelId: string) {
    return this.cloudinaryService.getVideoUploadSignature(
      videoId,
      `channels/${channelId}/videos`,
    );
  }

  // async updateVideoThumbnail(
  //   videoId: string,
  //   channelId: string,
  //   userId: string,
  //   thumbnailFile: Express.Multer.File,
  // ): Promise<VideoDetailsOwner> {
  //   // Verify ownership BEFORE touching Cloudinary
  //   const oldVideo = await this.videoRepo.findOneOwnerVideoDetails(
  //     videoId,
  //     userId,
  //   );
  //   if (!oldVideo) {
  //     throw new NotFoundException('video not found or not owned by channel');
  //   }

  //   // overwrite: true means this replaces the same asset in place, so
  //   // there's no old asset left to roll back / clean up on failure.
  //   const uploadResult = await this.cloudinaryService.uploadImage(
  //     thumbnailFile,
  //     `${videoId}_thumb`,
  //     `channels/${channelId}/thumbnails`,
  //   );

  //   // No thumbnailPublicId column - only the derived URL is persisted.
  //   const newVideo = await this.videoRepo.updateVideoDetails(
  //     videoId,
  //     channelId,
  //     { thumbnailUrl: uploadResult.secure_url },
  //     videoDetailsOwnerSelectFor(userId),
  //   );

  //   if (!newVideo) {
  //     // Row disappeared between the ownership check and the update
  //     // (e.g. deleted concurrently).
  //     throw new NotFoundException('video not found or not owned by channel');
  //   }

  //   return newVideo;
  // }

  async updateVideoMedia(
    videoId: string,
    channelId: string,
    video: Express.Multer.File,
    userId: string,
  ): Promise<VideoDetailsOwner> {
    if (!video) {
      throw new BadRequestException('video file is required');
    }

    // Verify ownership BEFORE touching Cloudinary
    const oldVideo = await this.videoRepo.findOneOwnerVideoDetails(
      videoId,
      userId,
    );
    if (!oldVideo) {
      throw new NotFoundException('video not found or not owned by channel');
    }

    const uploadResult = await this.cloudinaryService.uploadVideo(
      video,
      videoId,
      `channels/${channelId}/videos`,
    );

    const newVideo = await this.videoRepo.updateVideoDetails(
      videoId,
      channelId,
      { videoUrl: uploadResult.secure_url, publicId: uploadResult.public_id },
      videoDetailsOwnerSelectFor(userId),
    );

    if (!newVideo) {
      throw new NotFoundException('video not found or not owned by channel');
    }

    return newVideo;
  }

  // async getUploadSignature(channelId: string, videoId: string, folder: string) {
  //   const video = await this.videoRepo.findById(videoId);
  //   if (!video) {
  //     throw new NotFoundException('video not found');
  //   }
  //   return this.cloudinaryService.getVideoUploadSignature(video.id, folder);
  // }

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

    const publicId = payload.public_id;
    if (!publicId) return;

    const hlsResult = payload.eager?.[0];
    const isStillProcessing = hlsResult?.status === 'processing';
    const hasFailed = hlsResult?.status === 'failed' || hlsResult?.error;
    let status: VideoStatus;

    if (isStillProcessing) status = VideoStatus.PROCESSING;
    else if (hasFailed || !hlsResult?.secure_url) status = VideoStatus.FAILED;
    else status = VideoStatus.READY;

    try {
      return await this.videoRepo.handleUploadNotification({
        publicId,
        status,
        hlsUrl: status === VideoStatus.READY ? hlsResult?.secure_url : null,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        console.warn(`Webhook: video with publicId ${publicId} not found`);
        return;
      }
      throw err;
    }
  }
}
