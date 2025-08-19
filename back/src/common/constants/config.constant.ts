export const CONFIG = {
  APP: {
    NAME: 'ODRI Billing System',
    VERSION: process.env.APP_VERSION || '1.0.0',
    BUILD: process.env.APP_BUILD || 'N/A',
    RELEASE_DATE: process.env.APP_RELEASE_DATE || 'N/A',
    DEFAULT_LANGUAGE: 'en',
    DEFAULT_TIMEZONE: 'Africa/Nairobi',
  },

  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
    USERNAME: process.env.DB_USERNAME || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
    NAME: process.env.DB_NAME || 'odri_billing',
    SYNCHRONIZE: process.env.TYPEORM_SYNC === 'true',
    LOGGING: process.env.TYPEORM_LOGGING === 'true',
  },

  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    PASSWORD: process.env.REDIS_PASSWORD || undefined,
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'super-secret-key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  MPESA: {
    SHORT_CODE: process.env.MPESA_SHORT_CODE || '',
    CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
    CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
    PASSKEY: process.env.MPESA_PASSKEY || '',
    CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '',
    ENVIRONMENT: process.env.MPESA_ENVIRONMENT || 'sandbox', // or 'production'
  },

  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    USERNAME: process.env.SMTP_USERNAME || '',
    PASSWORD: process.env.SMTP_PASSWORD || '',
    FROM: process.env.EMAIL_FROM || 'no-reply@odriwifi.com',
  },

  SECURITY: {
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    ENABLE_2FA: process.env.ENABLE_2FA === 'true',
  },

  BACKUP: {
    ENABLED: process.env.BACKUP_ENABLED === 'true',
    SCHEDULE: process.env.BACKUP_SCHEDULE || '0 3 * * *', // Daily at 3 AM
    STORAGE_PATH: process.env.BACKUP_STORAGE_PATH || './backups',
  },
};

// Direct exports for frequently used constants
export const AppName = CONFIG.APP.NAME;
export const AppVersion = {
  VERSION: CONFIG.APP.VERSION,
  BUILD: CONFIG.APP.BUILD,
  RELEASE_DATE: CONFIG.APP.RELEASE_DATE,
};
export const AppTimezone = CONFIG.APP.DEFAULT_TIMEZONE;
