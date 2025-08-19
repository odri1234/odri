import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';

export const databaseConfigSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
});

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions & {
    seeds?: string[];
    cli?: { migrationsDir?: string };
  } => {
    if (!process.env.DB_HOST) throw new Error('DB_HOST is not defined');
    if (!process.env.DB_USERNAME) throw new Error('DB_USERNAME is not defined');
    if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD is not defined');
    if (!process.env.DB_NAME) throw new Error('DB_NAME is not defined');

    const synchronize =
      process.env.DB_SYNCHRONIZE === 'true' || process.env.DB_SYNCHRONIZE === '1';
    const logging =
      process.env.DB_LOGGING === 'true' || process.env.DB_LOGGING === '1';

    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME,
      database: process.env.DB_NAME,
      synchronize,
      logging,
    });

    return {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,

      // Use 'database' here, NOT 'name'
      database: process.env.DB_NAME,

      synchronize,
      logging,

      // Make sure to include entities from all modules
      entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],

      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

      seeds: [__dirname + '/../database/seeds/*{.ts,.js}'],
      cli: {
        migrationsDir: 'src/database/migrations',
      },

      ssl: false,

      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  },
);
