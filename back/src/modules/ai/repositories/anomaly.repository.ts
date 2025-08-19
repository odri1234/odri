import { Injectable } from '@nestjs/common';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Anomaly } from '../entities/anomaly.entity';

@Injectable()
export class AnomalyRepository extends Repository<Anomaly> {
  constructor(private readonly dataSource: DataSource) {
    super(Anomaly, dataSource.createEntityManager());
  }

  // Get latest anomalies
  async findLatest(limit = 50): Promise<Anomaly[]> {
    return this.find({
      order: { detectedAt: 'DESC' },
      take: limit,
    });
  }

  // Find anomalies by userId
  async findByUser(userId: string): Promise<Anomaly[]> {
    return this.find({
      where: { userId } as FindOptionsWhere<Anomaly>,
      order: { detectedAt: 'DESC' },
    });
  }

  // Find anomalies of a specific type
  async findByType(type: string): Promise<Anomaly[]> {
    return this.find({
      where: { type } as FindOptionsWhere<Anomaly>,
      order: { detectedAt: 'DESC' },
    });
  }
}
