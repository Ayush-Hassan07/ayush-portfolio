import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const allowedOrigins = (
    process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:3001'
  ).split(',');
  app.enableCors({ origin: allowedOrigins, credentials: true });
  await app.listen(process.env.API_PORT ?? 4000);
}
void bootstrap();
