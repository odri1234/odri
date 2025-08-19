import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import helmet from 'helmet';
import compression from 'compression';

import { createLogger } from './bootstrap/logger';
import { setupSwagger } from './bootstrap/swagger';
import { setupMetrics } from './bootstrap/metrics';
import { setupShutdownHooks } from './bootstrap/shutdown';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { FixedHttpExceptionFilter } from './common/filters/fixed-http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RedisService } from './shared/redis/redis.service';
import { PublicRoutesHelper } from './common/helpers/public-routes.helper';

async function bootstrap(): Promise<void> {
  const logger = createLogger();
  const app = await NestFactory.create(AppModule, { logger });
  const config = app.get(ConfigService);

  const PORT = config.get<number>('APP_PORT') || 3000;
  const ENV = config.get<string>('NODE_ENV') || 'development';
  const PREFIX = config.get<string>('APP_PREFIX') || 'api';

  // ======================
  // WebSocket Support
  // ======================
  app.useWebSocketAdapter(new WsAdapter(app));

  // ======================
  // Security & Performance Middleware
  // ======================
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  // ======================
  // CORS Configuration
  // ======================
  const corsOriginRaw = config.get<string>('CORS_ORIGIN') ?? '*';
  const isWildcard = corsOriginRaw === '*';

  app.enableCors({
    origin: isWildcard ? true : corsOriginRaw.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Bearer',
      'X-Auth-Token',
      'Cache-Control',
      'x-tenant-id',
      'X-API-Key',
      'X-Custom-Header',
    ],
    exposedHeaders: [
      'Authorization',
      'X-Total-Count',
      'X-Page-Count',
      'X-Auth-Token',
      'Set-Cookie',
    ],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ======================
  // Global API Prefix & Versioning
  // ======================
  app.setGlobalPrefix(PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // ======================
  // Validation, Filters & Interceptors
  // ======================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: ENV === 'production',
      // ADDED: Better error handling for validation
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          return `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`;
        });
        return new Error(`Validation failed: ${messages.join('; ')}`);
      },
    }),
  );

  app.useGlobalFilters(new FixedHttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ======================
  // Swagger Setup
  // ======================
  const enableSwagger = config.get<string>('ENABLE_SWAGGER') === 'true';
  if (enableSwagger) {
    setupSwagger(app, PORT, PREFIX);
  }

  // ======================
  // Prometheus Metrics
  // ======================
  setupMetrics();

  // ======================
  // Graceful Shutdown Hooks
  // ======================
  setupShutdownHooks(app);

  // ======================
  // Redis Connection Check
  // ======================
  const redisService = app.get(RedisService);
  try {
    await redisService.ping();
    logger.log('✅ Redis connection successful');
  } catch (error) {
    logger.error(
      '❌ Redis connection failed:',
      error instanceof Error ? error.message : error,
    );
  }

  // ======================
  // Health Check Endpoint (Fixed Path)
  // ======================
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  
  // FIXED: Add health check at root level and under API prefix
  instance.get('/health', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: ENV,
    });
  });

  // Also add under the API prefix for consistency
  instance.get(`/${PREFIX}/v1/health`, (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: ENV,
    });
  });

  // ======================
  // Log Public Routes
  // ======================
  try {
    const publicRoutesHelper = app.get(PublicRoutesHelper);
    publicRoutesHelper.logPublicRoutes();
  } catch (error) {
    logger.error('Failed to log public routes:', error);
  }

  // ======================
  // Start Server
  // ======================
  await app.listen(PORT);

  logger.log(`🚀 ODRI API running at: http://localhost:${PORT}/${PREFIX}`);
  logger.log(`💚 Health check at: http://localhost:${PORT}/health`);
  if (enableSwagger) {
    logger.log(`📚 Swagger docs at: http://localhost:${PORT}/${PREFIX}/docs`);
  }
  logger.log(`📈 Prometheus metrics at: http://localhost:9100/metrics`);
  logger.log(`🌍 Environment: ${ENV}`);
  logger.log(`🔗 CORS enabled for: ${isWildcard ? 'ALL (*)' : corsOriginRaw}`);
  logger.log(`🔒 JWT authentication active with improved token handling`);
  
  // ADDED: Log expected route format
  logger.log(`📋 API routes available at: /${PREFIX}/v1/{endpoint}`);
}

bootstrap();