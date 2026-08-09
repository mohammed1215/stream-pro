import { forwardRef, Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository],
  exports: [NotificationsService],
  imports: [forwardRef(() => UserModule)],
})
export class NotificationsModule {}
