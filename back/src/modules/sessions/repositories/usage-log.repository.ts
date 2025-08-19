import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsageLog } from '../entities/usage-log.entity';

@Injectable()
export class UsageLogRepository extends Repository<UsageLog> {
  constructor(private readonly dataSource: DataSource) {
    super(UsageLog, dataSource.createEntityManager());
  }

  /**
   * Find usage logs for a specific session
   */
  async findBySessionId(sessionId: string): Promise<UsageLog[]> {
    return this.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Log a new usage entry
   */
  async logUsage(
    sessionId: string,
    userId: string,
    dataUsed: number,
    uploadBytes: number = 0,
    downloadBytes: number = 0,
  ): Promise<UsageLog> {
    const usage = this.create({
      sessionId,
      userId,
      dataUsed,
      uploadBytes,
      downloadBytes,
      usageStartTime: new Date(), // you can customize this
      timestamp: new Date(),
    });

    return this.save(usage);
  }
}
