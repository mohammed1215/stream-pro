import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ChannelModule } from './channel/channel.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { VideoProcessingService } from './video-processing/video-processing.service';
import { extname } from 'path';

export const VIDEO_STORAGE = diskStorage({
  destination: '/tmp/uploads',
  filename(req, file, callback) {
    const uuid = crypto.randomUUID();
    const filename = uuid + extname(file.originalname);
    callback(null, filename);
  },
});

@Module({
  imports: [
    PrismaModule,
    UserModule,
    MulterModule.register({
      storage: VIDEO_STORAGE,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          secret: config.get('JWT_ACCESS_TOKEN_SECRET'),
        };
      },
    }),
    PrismaModule,
    ChannelModule,
    CloudinaryModule,
    VideosModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, VideoProcessingService],
})
export class AppModule {}
