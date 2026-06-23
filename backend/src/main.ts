import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './common/utils/validation-exception-factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ── Security & Performance Middleware ────────────────────────────────────
  app.use(
    helmet({
      // Allow cookies from the same origin for HttpOnly JWT cookie auth
      crossOriginResourcePolicy: { policy: 'same-site' },
      // Content-Security-Policy: tighten per your needs in production
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }),
  );

  // Gzip compress all responses (reduces bandwidth ~70%)
  app.use(compression());

  app.use(cookieParser());

  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'));

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const port = config.get<number>('PORT', 3000);
  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');
  const env = config.get<string>('NODE_ENV', 'development');

  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`
╔══════════════════════════════════════════════════╗
║          OmniSpace Backend — Running              ║
╠══════════════════════════════════════════════════╣
║  Environment : ${env.padEnd(32)}║
║  API Base    : http://localhost:${String(port).padEnd(5)} / ${apiPrefix.padEnd(16)}║
║  Health      : http://localhost:${String(port).padEnd(5)} / ${apiPrefix}/health║
╚══════════════════════════════════════════════════╝
  `);
}

bootstrap();
