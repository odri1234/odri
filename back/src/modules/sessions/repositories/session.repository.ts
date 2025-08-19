// src/modules/sessions/repositories/session.repository.ts

import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionRepository extends Repository<Session> {
  constructor(private readonly dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }

  // ✅ Find all active sessions for a given user
  async findActiveSessionsByUser(userId: string): Promise<Session[]> {
    return this.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ End all active sessions for a specific user
  async endAllSessions(userId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Session)
      .set({ isActive: false, endTime: new Date() })
      .where('userId = :userId AND isActive = true', { userId })
      .execute();
  }

  // 🆕 Optional: Soft-delete sessions (if soft delete is enabled)
  // async softDeleteSessions(userId: string): Promise<void> {
  //   await this.softDelete({ userId });
  // }

  // 🆕 Optional: Count active sessions for analytics
  // async countActiveSessions(ispId: string): Promise<number> {
  //   return this.count({ where: { ispId, isActive: true } });
  // }
}
