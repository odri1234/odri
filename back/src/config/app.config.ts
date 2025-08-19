import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfigSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('Internet Billing System'),
  APP_URL: Joi.string().uri().required(),
  API_VERSION: Joi.string().default('v1'),
  CORS_ORIGIN: Joi.string().required(),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  BCRYPT_ROUNDS: Joi.number().default(12),
  ENCRYPTION_KEY: Joi.string().length(32).required(),
  ENCRYPTION_IV: Joi.string().length(16).required(),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  LOG_MAX_FILES: Joi.number().default(30),
  LOG_MAX_SIZE: Joi.string().default('20m'),
});

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  name: process.env.APP_NAME || 'Internet Billing System',
  url: process.env.APP_URL,
  apiVersion: process.env.API_VERSION || 'v1',

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionIv: process.env.ENCRYPTION_IV,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '30', 10),
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
}));
