import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ===============================
  // Application Info
  // ===============================
  APP_NAME: Joi.string().default('ODRI WiFi System'),
  APP_ENV: Joi.string().valid('development', 'production', 'test').required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  APP_PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // ===============================
  // Security & JWT
  // ===============================
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),

  // ===============================
  // PostgreSQL Database
  // ===============================
  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // ===============================
  // Redis
  // ===============================
  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('', null),

  // ===============================
  // M-PESA
  // ===============================
  MPESA_ENVIRONMENT: Joi.string().valid('sandbox', 'production').required(),
  MPESA_CONSUMER_KEY: Joi.string().required(),
  MPESA_CONSUMER_SECRET: Joi.string().required(),
  MPESA_SHORTCODE: Joi.string().required(),
  MPESA_PASSKEY: Joi.string().required(),
  MPESA_CALLBACK_URL: Joi.string().uri({ scheme: [/https?/] }).required(),
  MPESA_CONFIRMATION_URL: Joi.string().uri({ scheme: [/https?/] }).required(),
  MPESA_VALIDATION_URL: Joi.string().uri({ scheme: [/https?/] }).required(),

  // ===============================
  // Email
  // ===============================
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),

  // ===============================
  // Telegram
  // ===============================
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_CHAT_ID: Joi.string().required(),

  // ===============================
  // MikroTik
  // ===============================
  MIKROTIK_HOST: Joi.string().required(),
  MIKROTIK_PORT: Joi.number().default(8728),
  MIKROTIK_USERNAME: Joi.string().required(),
  MIKROTIK_PASSWORD: Joi.string().required(),
  MIKROTIK_SSL: Joi.boolean().default(false),

  // ===============================
  // Backup
  // ===============================
  BACKUP_CRON: Joi.string().required(),
  BACKUP_PATH: Joi.string().default('./backups'),
  BACKUP_RETENTION_DAYS: Joi.number().default(7),

  // ===============================
  // Monitoring & Metrics
  // ===============================
  PROMETHEUS_METRICS_ENABLED: Joi.boolean().default(true),

  // ===============================
  // AI/ML Settings
  // ===============================
  AI_MODEL_PATH: Joi.string().default('./models/'),
  AI_ANOMALY_THRESHOLD: Joi.number().min(0).max(1).default(0.75),
  AI_DYNAMIC_PRICING_ENABLED: Joi.boolean().default(true),

  // ===============================
  // Admin
  // ===============================
  DEFAULT_ADMIN_EMAIL: Joi.string().email().required(),
  DEFAULT_ADMIN_PASSWORD: Joi.string().min(8).required(),

  // ===============================
  // Multi-Tenant
  // ===============================
  MULTI_TENANCY_ENABLED: Joi.boolean().default(true),
  DEFAULT_TENANT: Joi.string().required(),

  // ===============================
  // Logging
  // ===============================
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('debug'),
  LOG_RETENTION_DAYS: Joi.number().default(14),

  // ===============================
  // CDN & SMS
  // ===============================
  CDN_BASE_URL: Joi.string().uri({ scheme: [/https?/] }).required(),

  SMS_API_URL: Joi.string().uri({ scheme: [/https?/] }).required(),
  SMS_API_KEY: Joi.string().required(),
  SMS_SENDER_ID: Joi.string().required(),
});
