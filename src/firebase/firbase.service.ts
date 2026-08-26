import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { App, AppOptions, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const serviceAccountString = this.config.get<string>(
      'FIREBASE_SERVICE_ACCOUNT',
    );
    if (!serviceAccountString) {
      throw new InternalServerErrorException(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set',
      );
    }
    const serviceAccount: AppOptions = JSON.parse(serviceAccountString);

    this.app = initializeApp({ credential: cert(serviceAccount) });
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: Message = {
      notification: { title, body },
      token,
      data,
    };

    try {
      const messaging = getMessaging(this.app);
      const response = await messaging.send(message);
      return { success: true, messageId: response };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`FCM Delivery Failed: ${message}`);
    }
  }
}
