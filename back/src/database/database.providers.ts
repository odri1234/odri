import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const options: PostgresConnectionOptions = {
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity.{ts,js}'],
        synchronize: false, // NEVER true in production
        logging: configService.get<boolean>('DB_LOGGING') || false,
        
        // SSL disabled
        ssl: false,
      };

      const dataSource = new DataSource(options);
      return dataSource.initialize();
    },
  },
];
