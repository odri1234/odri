import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UsageLog } from '../entities/usage-log.entity';

@Injectable()
export class UsageLogRepository extends Repository<UsageLog> {
  constructor(private readonly dataSource: DataSource) {
    super(UsageLog, dataSource.createEntityManager());
  }

  async findRecentLogs(limit = 100) {
    return this.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
