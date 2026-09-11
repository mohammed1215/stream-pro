// cloudinary.config.ts
import { ConfigOptions } from 'cloudinary';
import { config } from 'dotenv';
config();

// Validate environment variables
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const EAGER_NOTIFICATION_URL = process.env.CLOUDINARY_EAGER_NOTIFICATION_URL;

export const cloudinaryConfig: ConfigOptions = {
  api_key: API_KEY,
  api_secret: API_SECRET,
  cloud_name: CLOUD_NAME,
  eagerNotificationUrl: EAGER_NOTIFICATION_URL,
};
