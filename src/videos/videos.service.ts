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

  getAllVideosOfChannel(channelId: string, page: number, limit: number) {
    return this.videoRepo.findAllVideosOfChannel(channelId, page, limit);
  }

  getOwnerVideos(channelId: string, page: number, limit: number) {
    return this.videoRepo.findAllVideosOfOwnerChannel(channelId, page, limit);
  }

  async findOneVideoDetails(videoId: string) {
    const videoData = await this.videoRepo.findOneVideoDetails(videoId);
    if (!videoData) throw new NotFoundException();
    return videoData;
  }

  // ================================= Updates ==============================

  async updateViews(videoId: string) {
    return this.videoRepo.updateViews(videoId);
  }

  remove(id: number) {
    return `This action removes a #${id} video`;
  }

  removeFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log('Error while removing file: ', err.message);
      }
    });
  }
}
