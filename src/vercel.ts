import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import type { Request, Response } from 'express';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const expressApp = express();
let cachedApp: any = null;

async function createNestApp() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription(
      'Welcome to the API documentation. \n\n' +
        '**[Download OpenAPI JSON Specification File Route](/api/docs-json)**',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.init();
  return app;
}

// Serverless entry point — Vercel calls this on every request
export default async function handler(req: Request, res: Response) {
  if (!cachedApp) {
    cachedApp = await createNestApp();
  }
  expressApp(req, res);
}

// Local dev entry point — `npm run start:dev` still works normally
if (process.env.VERCEL !== '1') {
  createNestApp().then((app) => {
    const port = Number(process.env.PORT ?? 3000);
    app.listen(port).then(() => {
      console.log(`Application running on port ${port}`);
    });
  });
}
