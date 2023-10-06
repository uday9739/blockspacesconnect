import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import * as cookieParser from 'cookie-parser';
import { env } from './env';
const whitelist = ['https://localhost', 'http://localhost:3071', 'http://localhost:3069', 'https://accounts.google.com'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: whitelist, credentials: true });
  app.use(cookieParser());
  app.setGlobalPrefix("/admin-portal/api");

  await app.listen(3071);
}
bootstrap();
