import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),

  //   Database
  DATABASE_URL: Joi.string().required(),

  // JWT
  JWT_ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),

  //   //   Google OAuth
  //   GOOGLE_CLIENT_ID: Joi.string().required(),
  //   GOOGLE_CLIENT_SECRET: Joi.string().required(),
  //   GOOGLE_REDIRECT_URI: Joi.string().required(),

  //  Cloudinary
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_EAGER_NOTIFICATION_URL: Joi.string().uri().optional(),

  //   Firebase
  FIREBASE_SERVICE_ACCOUNT: Joi.string().required(),

  //   Cors
  ALLOWED_ORIGINS: Joi.string().required(),

  //  Upstash Redis
  UPSTASH_REDIS_REST_URL: Joi.string().uri().required(),
  UPSTASH_REDIS_REST_TOKEN: Joi.string().required(),
});
