// cloudinary.config.ts
import { ConfigOptions } from 'cloudinary';
import { config } from 'dotenv';
config();

// Validate environment variables
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const EAGER_NOTIFICATION_URL = process.env.CLOUDINARY_EAGER_NOTIFICATION_URL;

if (!API_KEY || !API_SECRET || !CLOUD_NAME) {
  throw new Error(`
    Missing Cloudinary environment variables!
    Please check your .env file contains:
    CLOUDINARY_API_KEY=your_key
    CLOUDINARY_API_SECRET=your_secret  
    CLOUDINARY_CLOUD_NAME=your_cloud_name
  `);
}

export const cloudinaryConfig: ConfigOptions = {
  api_key: API_KEY,
  api_secret: API_SECRET,
  cloud_name: CLOUD_NAME,
  eagerNotificationUrl: EAGER_NOTIFICATION_URL,
};
