import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { App, AppOptions, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { readFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: App;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const path =
      this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH') ??
      './src/firebase/stream-pro-7e2d1-firebase-adminsdk-fbsvc-051010650a.json';

    const data = await readFile(path, 'utf8');
    const serviceAccount: AppOptions = JSON.parse(data);

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
