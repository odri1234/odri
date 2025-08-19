import 'dotenv/config';
import { DataSource } from 'typeorm';
import path from 'path';

// Log loaded environment variables (masking password)
console.log('Loaded env vars:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD ? '******' : undefined,
  DB_NAME: process.env.DB_NAME,
  DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE,
  DB_LOGGING: process.env.DB_LOGGING,
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'odri',
  password: process.env.DB_PASSWORD || '17049381',
  database: process.env.DB_NAME || 'odriwifi',
  schema: 'public',
  synchronize: process.env.DB_SYNCHRONIZE === 'true', // only in dev!
  logging: process.env.DB_LOGGING === 'true',

  // Entities and Migrations
  entities: [path.resolve(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [path.resolve(__dirname, './migrations/*.{ts,js}')],

  // Connection Pool Settings
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // SSL setup for production (optional)
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
