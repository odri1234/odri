import { Injectable } from '@nestjs/common';
import { createConnection, getConnectionManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../shared/redis/redis.service';

@Injectable()
export class TenantConnectionService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService
  ) {}

  async getTenantConnection(tenantId: string) {
    const connectionName = `tenant_${tenantId}`;
    const connectionManager = getConnectionManager();

    if (connectionManager.has(connectionName)) {
      return connectionManager.get(connectionName);
    }

    const dbName = await this.redisService.get(`tenant:${tenantId}:dbName`);

    if (!dbName) throw new Error(`No DB mapped for tenant: ${tenantId}`);

    return createConnection({
      name: connectionName,
      type: 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.username'),
      password: this.configService.get<string>('database.password'),
      database: dbName,
      synchronize: false,
      logging: false,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    });
  }
}
