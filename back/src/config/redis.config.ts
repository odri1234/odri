// src/config/redis.config.ts
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const redisConfigSchema = Joi.object({
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow(''),
  REDIS_DB: Joi.number().default(0),

  QUEUE_REDIS_HOST: Joi.string().required(),
  QUEUE_REDIS_PORT: Joi.number().default(6379),
  QUEUE_REDIS_PASSWORD: Joi.string().allow(''),
  QUEUE_REDIS_DB: Joi.number().default(1),
});

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // Advanced options for ioredis
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  enableReadyCheck: true,
  maxRetriesPerRequest: 5,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4, // IPv4

  // Queue-specific Redis instance (e.g., for BullMQ)
  queue: {
    host: process.env.QUEUE_REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.QUEUE_REDIS_PORT || '6379', 10),
    password: process.env.QUEUE_REDIS_PASSWORD || undefined,
    db: parseInt(process.env.QUEUE_REDIS_DB || '1', 10),
  },
}));
