import { Injectable, NotFoundException } from '@nestjs/common';
import { DownloadRepository } from './repositories/download.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Readable } from 'stream';

@Injectable()
export class DownloadsService {
  constructor(
    private readonly downloadRepository: DownloadRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  createDownload(videoId: string, userId: string) {
    return this.downloadRepository.create(videoId, userId);
  }

  async downloadVideo(videoId: string, userId: string) {
    const video = await this.downloadRepository.findById(videoId);
    if (!video?.publicId) throw new NotFoundException('something went wrong');

    await this.createDownload(videoId, userId);
    const downloadUrl = this.cloudinaryService.generateDownloadSignedUrl(
      video.publicId,
    );

    console.log(video.publicId, downloadUrl);

    const cloudinaryResponse = await fetch(downloadUrl);
    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      const errorBody = await cloudinaryResponse.text().catch(() => 'no body');
      console.error('Cloudinary error:', {
        status: cloudinaryResponse.status,
        statusText: cloudinaryResponse.statusText,
        body: errorBody,
      });
      throw new NotFoundException(
        `Cloudinary fetch failed (${cloudinaryResponse.status}): ${errorBody}`,
      );
    }

    return {
      title: video.title,
      contentLength: cloudinaryResponse.headers.get('content-length'),
      stream: Readable.fromWeb(cloudinaryResponse.body as any),
    };
  }
}
