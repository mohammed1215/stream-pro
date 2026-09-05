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
import { memoryStorage } from 'multer';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { VideoProcessingService } from './video-processing/video-processing.service';
import { LoggerInterceptor } from './logger/logger.interceptor';
import { LikesModule } from './likes/likes.module';
import { WatchlaterModule } from './watchlater/watchlater.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FirebaseModule } from './firebase/firebase.module';
import { HomeModule } from './home/home.module';
import { WatchHistoryModule } from './watch-history/watch-history.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WeebhooksModule } from './weebhooks/weebhooks.module';
import { WebhooksController } from './webhooks/webhooks.controller';

export const VIDEO_STORAGE = memoryStorage();

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
          signOptions: { expiresIn: 4 * 60 * 60 },
        };
      },
    }),
    PrismaModule,
    ChannelModule,
    CloudinaryModule,
    VideosModule,
    CommentsModule,
    LikesModule,
    WatchlaterModule,
    SubscriptionsModule,
    PlaylistsModule,
    NotificationsModule,
    FirebaseModule,
    HomeModule,
    WatchHistoryModule,

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
    ]),

    WeebhooksModule,
  ],
  controllers: [AppController, WebhooksController],
  providers: [
    AppService,
    VideoProcessingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized');
  }
}
