import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from '../modules/sessions/sessions.service';

@Injectable()
export class SessionCleanupJob {
  private readonly logger = new Logger(SessionCleanupJob.name);

  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Runs every hour to clean expired sessions.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.log('Running expired session cleanup...');
    try {
      const result: { cleanedCount: number } = await this.sessionsService.cleanupExpiredSessions();
      this.logger.log(`Expired session cleanup done. Cleaned: ${result.cleanedCount}`);
    } catch (error) {
      this.logError('Failed to clean expired sessions', error);
    }
  }

  /**
   * Runs daily at 1:30 AM to archive old session usage logs.
   */
  @Cron('30 1 * * *')
  async archiveOldUsageLogs(): Promise<void> {
    this.logger.log('Archiving old session usage logs...');
    try {
      const archivedCount: number = await this.sessionsService.archiveOldUsageLogs();
      this.logger.log(`Archived usage logs count: ${archivedCount}`);
    } catch (error) {
      this.logError('Error archiving usage logs', error);
    }
  }

  /**
   * Runs daily at 3:00 AM to clean up inactive devices.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupInactiveDevices(): Promise<void> {
    this.logger.log('Cleaning up inactive devices...');
    try {
      const removedCount: number = await this.sessionsService.cleanupInactiveDevices();
      this.logger.log(`Inactive devices removed: ${removedCount}`);
    } catch (error) {
      this.logError('Failed to clean inactive devices', error);
    }
  }

  /**
   * Helper method to log errors consistently.
   */
  private logError(message: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(message, error.stack);
    } else {
      this.logger.error(message, String(error));
    }
  }
}
