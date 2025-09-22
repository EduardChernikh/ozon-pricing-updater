import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import {json, urlencoded} from "express";

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.enableShutdownHooks();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: process.env.NODE_ENV == 'production',
      stopAtFirstError: process.env.NODE_ENV == 'production',
      whitelist: true
    })
  );

  app.use(helmet({contentSecurityPolicy: false}));

  app.use(json({limit: '500mb'}));
  app.use(urlencoded({extended: true, limit: '500mb'}));

  await app.listen(3000);
}

bootstrap().then(() => {
  if (process.env.NODE_ENV != 'production')
    console.log(`NestJS App started on port 3000`);
});


